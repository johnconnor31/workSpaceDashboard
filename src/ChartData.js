import React, { useRef, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
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
	},
	chip: {
		cursor: 'move'
	}
}));
const chartDataStyle = (top, left) => ({
	width: '16%',
	height: 'fit-content',
	top,
	left,
	position: 'absolute'
});
export default function ChartData(props) {
	const chartDataRef = useRef();
	const { index, dataSet, dataId, changeDataId, positions, widgetSourceId, setWidgetPositions, initialPosition, addWidgetDataSource, getNextInitialPos, dataSets, changeDataSource } = props;
	console.log('chart data', dataSets, widgetSourceId);
	const [, drag ] = useDrag({
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
					<Chip
					classes={{root: styles.chip}}
					label={'widget-'+index}
					size='small'
					/>
					<Select value={widgetSourceId} classes={{root: styles.dropDown}} onChange={(event) => changeDataSource(index, event.target.value)}>
					{dataSets.map((dataSet, i) => 
						<MenuItem key={'sourceMenu'+i} value={i}>
							{dataSet.name}
						</MenuItem>
					)}
					</Select>
					<IconButton classes={{root: styles.addNewDataChart}} onClick={addWidgetDataSource}><AddCircleIcon /></IconButton>
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
