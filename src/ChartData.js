import React, { useState, useRef, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';
import { useDrag } from 'react-dnd';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const useStyles = makeStyles(() => ({
	root: {
		height: '400px',
		overflow: 'scroll',
		opacity: (props) => (props.isDragging ? 0.5 : 1),
		zIndex: 1
	},
	subHeader: {
		backgroundColor: 'white',
		cursor: 'move'
	},
	addNewDataChart: {
		float: 'right'
	}
}));
const chartDataStyle = (top, left) => ({
	width: '15%',
	height: 'fit-content',
	top,
	left,
	position: 'absolute'
});
export default function ChartData(props) {
	const chartDataRef = useRef();
	const { index, dataSet, dataId, changeDataId, positions, setWidgetPositions, initialPosition, addWidgetDataSource, getNextInitialPos } = props;
	console.log('chart data positions', positions);
	const [ isDragging, drag ] = useDrag({
		item: {
			type: 'chartData',
			index
		},
		collect: (monitor) => {
			console.log('isdragging', monitor.isDragging());
			return {
			isDragging: !!monitor.isDragging()
		}
	}
	});
	const position = positions['chartData'+index];
	let top = position && position[0];
	let left = position && position[1];
	if(!top && !left) {
		if(index === 0){
			top = initialPosition[0];
			left = initialPosition[1];
		} else {
			const initial = getNextInitialPos('chartData');
			top = initial[0];
			left = initial[1];
			console.log('got new initial pos', top, left);
		}
	}
	useEffect(
		() => {
			setWidgetPositions((widget) => {
				return {
					...widget,
					['chartData'+index]: [ top, left, chartDataRef.current.clientHeight, chartDataRef.current.clientWidth ]
				};
			});
		},
		[ chartDataRef ]
	);
	const styles = useStyles();
	return (
		<div ref={chartDataRef} style={chartDataStyle(top, left)}>
			<List
				classes={{ root: styles.root }}
				component="nav"
				subheader={
					<>
					<ListSubheader component="div" classes={{ root: styles.subHeader }}>
						Apple (AAPL) Stock
					<IconButton classes={{root: styles.addNewDataChart}} onClick={addWidgetDataSource}><AddCircleIcon /></IconButton>
					</ListSubheader>
					</>
				}
				ref={drag}
			>
				<ChartList dataSet={dataSet} selectedindex={dataId} onClickItem={(value) => changeDataId(index, value)} />
			</List>
		</div>
	);
}

function ChartList({ dataSet, selectedindex, onClickItem }) {
	return dataSet.map((item, i) => (
		<ListItem button key={item.name} selected={selectedindex === i} onClick={() => onClickItem(i)}>
			<ListItemText primary={item.name} />
		</ListItem>
	));
}
