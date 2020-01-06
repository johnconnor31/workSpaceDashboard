import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import ChartData from './ChartData';
import ChartGraph from './ChartGraph';
import Notifications from './Notifications';
import dataJson from './static/data';
import './App.css';

const dataSets = arrangeData();

function App() {
	const [ widgetDataSources, setWidgetDataSources ] = useState([ 0 ]);
	const [ dataIds, setDataIds ] = useState(widgetDataSources.map(() => 0));
	const [ graphWidgets, setGraphWidgets ] = useState([ 0 ]);
	function addWidgetDataSource() {
		const newSources = Object.assign([], widgetDataSources);
		const newDataIds = Object.assign([], dataIds);
		newDataIds.push(0);
		widgetDataSources.push(0);
		setWidgetDataSources(widgetDataSources);
		setDataIds(newDataIds);
	}

	function addGraphWidget() {
		const newGraphWidgets = Object.assign([], graphWidgets);
		newGraphWidgets.push(0);
		setGraphWidgets(newGraphWidgets);
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
		accept: [ 'chartData', 'chartGraph', 'notifications' ],
		drop: (item, monitor) => {
			const elementType = item.index !== undefined ? item.type + item.index : item.type;
			console.log('type', elementType);
			const difference = monitor.getDifferenceFromInitialOffset();
			const newWidgetPos = calculateNewPosition(difference, widgetPositions, elementType);
			if (newWidgetPos) {
				setWidgetPositions(newWidgetPos);
			}
		}
	});

	const [ widgetPositions, setWidgetPositions ] = useState({
		chartData0: [],
		chartGraph0: [],
		notifications: []
	});

	function calculateNewPosition(difference, widgetPositions, elementType) {
		const widgetPos = Object.assign({}, widgetPositions);
		const currentWidget = widgetPos[elementType];
		console.log('difference', difference, currentWidget);
		if (currentWidget[0] + difference.y < 0) {
			currentWidget[0] = 0;
		} else {
			currentWidget[0] += difference.y;
		}
		if (currentWidget[1] + difference.x < 0) {
			currentWidget[1] = 0;
		} else {
			currentWidget[1] += difference.x;
		}
		const fixedWidget = fixOverlap(currentWidget, widgetPos, elementType);
		return { ...widgetPos, [elementType]: fixedWidget };
	}

	function fixOverlap(widget, widgetPositions, elementType) {
		for (var key in widgetPositions) {
			if (key !== elementType) {
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
				if (
					(widgetTop > top && widgetTop < top + height) ||
					(widgetTop + widgetHeight > top && widgetTop + widgetHeight < top + height)
				) {
					if (
						(widgetLeft > left && widgetLeft < left + width) ||
						(widgetLeft + widgetWidth > left && widgetLeft + widgetWidth < left + width)
					) {
						console.log('there is overlap');
						// 10px for a small gap between widgets side-by-side
						widget[1] = left - widget[3] - 10;
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
		const lastWidget = widgetPositions[keys[keys.length - 1]];
		console.log('last widget', widgetPositions[keys[keys.length - 1]]);
		const currentWidgetWidth = widgetPositions[currentWidget + '0'][3];
		if (window.innerWidth < lastWidget[1] + lastWidget[3] + currentWidgetWidth) {
			console.log('screen width exceeded');
			const nextHeight = getMaxElHeight();
			console.log('next height', nextHeight);
			return [ nextHeight + 20, 10 ];
		}
		// 10px for gap between adjacent widgets
		return [ lastWidget[0], lastWidget[1] + lastWidget[3] + 10 ];
	}
	function getMaxElHeight() {
		let maxHeight = 0;
		for (var key in widgetPositions) {
			const pos = widgetPositions[key];
			if (maxHeight < pos[0] + pos[2]) {
				maxHeight = pos[0] + pos[2];
			}
		}
		return maxHeight;
	}
	function changeDataId(dataSourceIndex, value) {
		console.log('change id', dataSourceIndex, value);
		const newDataIds = Object.assign([], dataIds);
		newDataIds[dataSourceIndex] = value;
		setDataIds(newDataIds);
	}

	function changeDataSource(index, value){
		const newWidgetSources = Object.assign([], widgetDataSources);
		newWidgetSources[index] = value;
		console.log('widget sources changed', newWidgetSources);
		setWidgetDataSources(newWidgetSources);
	}

	function changeGraphSource(index, value){
		const newGraphWidgets = Object.assign([], graphWidgets);
		newGraphWidgets[index] = value;
		console.log('graph sources changed', newGraphWidgets);
		setGraphWidgets(newGraphWidgets);
	}
	return (
		<div className="App" ref={drop}>
			{widgetDataSources.map((widgetSourceId, i) => {
				const dataSet = dataSets[widgetSourceId].stockData;
				return (
					<ChartData
						index={i}
						dataSet={dataSet}
						dataId={dataIds[i]}
						changeDataId={changeDataId}
						widgetSourceId={widgetSourceId}
						positions={widgetPositions}
						setWidgetPositions={setWidgetPositions}
						initialPosition={[ 0, 0 ]}
						getNextInitialPos={getNextInitialPos}
						addWidgetDataSource={addWidgetDataSource}
						dataSets={dataSets}
						changeDataSource={changeDataSource}
					/>
				);
			})}
			{graphWidgets.map((graphSourceId, i) => {
				return (
					<ChartGraph
						index={i}
						graphSourceId={graphSourceId}
						dataIds={dataIds}
						positions={widgetPositions}
						setWidgetPositions={setWidgetPositions}
						initialPosition={[ 0, 350 ]}
						getNextInitialPos={getNextInitialPos}
						addGraphWidget={addGraphWidget}
						widgetDataSources={widgetDataSources}
						changeGraphSource={changeGraphSource}
						dataSets={dataSets}
					/>
				);
			})}
			<Notifications
				items={notifications}
				closeItem={closeNotification}
				positions={widgetPositions}
				setWidgetPositions={setWidgetPositions}
				initialPosition={[ 0, 1050 ]}
			/>
		</div>
	);
}

function arrangeData() {
	const result = { 
		name: dataJson.name
	};
	const stockData = [];
	dataJson.data.forEach((item) => {
		console.log('current item', item);
		const date = item['date'];
		for (var key in item) {
			if (key !== 'date') {
				let index = stockData.findIndex((item) => item.name === key);
				if (index === -1) {
					stockData.push({
						name: key,
						data: []
					});
					index = stockData.length - 1;
				}
				stockData[index].data.push({
					value: item[key],
					date
				});
			}
		}
	});
	result.stockData = stockData;
	console.log('result', result);
	return [ result, result, result ];
}

export default App;
