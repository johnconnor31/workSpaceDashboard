import React, { useState, useRef, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';
import { useDrag } from 'react-dnd';

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
	const { dataSet, dataId, changeDataId, positions, setWidgetPositions, initialPosition } = props;
	const [ isDragging, drag ] = useDrag({
		item: {
			type: 'chartData'
		},
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging()
		})
	});
	useEffect(
		() => {
			setWidgetPositions((widget) => {
				return {
					...widget,
					chartData: [ 0, 0, chartDataRef.current.clientHeight, chartDataRef.current.clientWidth ]
				};
			});
		},
		[ chartDataRef ]
	);
	console.log('widgets are', positions);
	const position = positions.chartData;
	let top = position[0];
	let left = position[1];
	if(!top && !left) {
		top = initialPosition[0];
		left = initialPosition[1];
	}
	const styles = useStyles();
	return (
		<div ref={chartDataRef} style={chartDataStyle(top, left)}>
			<List
				classes={{ root: styles.root }}
				component="nav"
				subheader={
					<ListSubheader component="div" classes={{ root: styles.subHeader }}>
						Apple (AAPL) Stock
					</ListSubheader>
				}
				ref={drag}
			>
				<ChartList dataSet={dataSet} selectedindex={dataId} onClickItem={changeDataId} />
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
