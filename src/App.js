import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import ChartData from './ChartData';
import ChartGraph from './ChartGraph';
import Notifications from './Notifications';
import data from './static/data';
import './App.css';

const dataSets = arrangeData();

function App() {
	const [ dataIds, setDataIds ] = useState([0]);
	const [widgetDataSources, setWidgetDataSources] = useState([0]);
	function addWidgetDataSource(){
		const newSources = Object.assign([], widgetDataSources);
		const newDataIds = Object.assign([], dataIds);
		newDataIds.push(0);
		widgetDataSources.push(0);
		setWidgetDataSources(widgetDataSources);
		setDataIds(newDataIds);
	}
	const [ notifications, setNotifications ] = useState([
		{ text: 'Apple stocks has just increased' },
		{ text: 'ICICI stocks collapsed' },
		{ text: 'ICICI stocks collapsed' },
		{ text: 'ICICI stocks collapsed' },
		{ text: 'ICICI stocks collapsed' },
		{ text: 'ICICI stocks collapsed' },
		{ text: 'ICICI stocks collapsed' }
	]);
	const [ , drop ] = useDrop({
		accept: ['chartData','chartGraph','notifications'],
		drop: (item, monitor) => {
			const elementType = item.index!==undefined ? item.type+item.index : item.type;
			console.log('type', elementType);
			const difference = monitor.getDifferenceFromInitialOffset();
			const newWidgetPos = calculateNewPosition(difference, widgetPositions, elementType);
			if(newWidgetPos){
				setWidgetPositions(newWidgetPos);
			}
		}
		});

	const [ widgetPositions, setWidgetPositions ] = useState({
		chartData0: [],
		chartGraph: [],
		notifications: []
	});


	function calculateNewPosition(difference, widgetPositions, elementType) {
		const widgetPos = Object.assign({}, widgetPositions);
		const currentWidget = widgetPos[elementType];
		console.log('difference', difference, currentWidget);
		if(currentWidget[0]+difference.y<0){
			currentWidget[0] = 0;
		} else {
			currentWidget[0]+=difference.y;
		}
		if(currentWidget[1]+difference.x<0){
			currentWidget[1] = 0;
		} else {
			currentWidget[1]+=difference.x;
		}
		const fixedWidget = fixOverlap(currentWidget, widgetPos, elementType);
		return {...widgetPos, [elementType]:fixedWidget}
	}

	function fixOverlap(widget, widgetPositions, elementType) {
		for(var key in widgetPositions) {
			if(key!== elementType) {
				const currentWidget = widgetPositions[key];
				console.log('checking overlap of ', widget, currentWidget);
			const top = currentWidget[0];
			const left = currentWidget[1];
			const height = currentWidget[2];
			const width = currentWidget[3];
			const widgetTop = widget[0];
			const widgetLeft = widget[1];
			const widgetHeight = widget[2];
			const widgetWidth = widget[3];
			if((widgetTop>top && widgetTop<top+height) || (widgetTop+widgetHeight>top && widgetTop+widgetHeight < top+height)){
				if((widgetLeft>left && widgetLeft<left+width) || (widgetLeft+widgetWidth> left && widgetLeft+widgetWidth< left+width)){
				console.log('there is overlap');
				widget[1] = left- widget[3];
				return widget;
				}
			}
		}
		}
		return widget;
	}

	function closeNotification(index) {
		const notifs = Object.assign([], notifications);
		notifs.splice(index, 1);
		setNotifications(notifs);
		console.log('closing', index, notifications);
	}
	function getNextInitialPos(currentWidget) {
		const keys = Object.keys(widgetPositions);
		const lastWidget = widgetPositions[keys[keys.length-1]];
		console.log('last widget', widgetPositions[keys[keys.length-1]]);
		const currentWidgetWidth = widgetPositions[currentWidget+'0'][3];
		if(window.innerWidth< lastWidget[1]+ lastWidget[3] + currentWidgetWidth) {
			console.log('screen width exceeded');
			const nextHeight = getMaxElHeight();
			console.log('next height', nextHeight);
			return [nextHeight+20, 10];
		}
		return [lastWidget[0], lastWidget[1]+ lastWidget[3]];
	}
	function getMaxElHeight(){
		let maxHeight=0;
		for(var key in widgetPositions) {
			const pos = widgetPositions[key];
			if(maxHeight< pos[0]+pos[2]) {
				maxHeight = pos[0]+pos[2];
			}
		}
			return maxHeight;
	}
	function changeDataId(index, value) {
		const newDataIds = Object.assign([], dataIds);
		newDataIds[index] = value;
		setDataIds(newDataIds);
	}
	return (
		<div className="App" ref={drop}>
			{widgetDataSources.map((widgetSource,i) => <ChartData
				index={i}
				changeDataId={changeDataId}
				dataSet={dataSets[widgetSource]}
				dataId={dataIds[i]}
				positions={widgetPositions}
				setWidgetPositions={setWidgetPositions}
				initialPosition={[0,0]}
				getNextInitialPos={getNextInitialPos}
				addWidgetDataSource={addWidgetDataSource}
			/>
			)}
			<ChartGraph dataSet={dataSets[0][dataIds[0]]} positions={widgetPositions} setWidgetPositions={setWidgetPositions} initialPosition={[0, 350]}/>
			<Notifications items={notifications} closeItem={closeNotification} positions={widgetPositions} setWidgetPositions={setWidgetPositions} initialPosition={[0, 1050]} />
		</div>
	);
}

function arrangeData() {
	const result = [];
	data.forEach((item) => {
		const date = item['date'];
		for (var key in item) {
			if (key !== 'date') {
				let index = result.findIndex((item) => item.name === key);
				if (index === -1) {
					result.push({
						name: key,
						data: []
					});
					index = result.length - 1;
				}
				result[index].data.push({
					value: item[key],
					date
				});
			}
		}
	});
	console.log('result', result);
	return [result, result, result];
}

export default App;
