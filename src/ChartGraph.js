import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { createChart } from 'lightweight-charts';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const useStyles = makeStyles(() => ({
	addNewDataChart: {
		float: 'right'
	}
}));

export default function ChartGraph(props) {
	const styles = useStyles();
	const chartGraphRef = useRef();
	const {
		index,
		dataSets,
		dataIds,
		graphSourceId,
		positions,
		setWidgetPositions,
		initialPosition,
		getNextInitialPos,
		addGraphWidget,
		widgetDataSources,
		changeGraphSource
	} = props;
	const widgetSource = widgetDataSources[graphSourceId];
	const dataId = dataIds[graphSourceId];
	const dataSet = dataSets[widgetSource].stockData[dataId];

	const [ isDragging, drag ] = useDrag({
		item: {
			type: 'chartGraph',
			index
		},
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging()
		})
	});
	const position = positions['chartGraph' + index];
	let top = position && position[0];
	let left = position && position[1];
	if (!top && !left) {
		if (index === 0) {
			top = initialPosition[0];
			left = initialPosition[1];
		} else {
			const initial = getNextInitialPos('chartGraph');
			top = initial[0];
			left = initial[1];
		}
	}
	useEffect(
		() => {
			setWidgetPositions((widget) => {
				return {
					...widget,
					['chartGraph' + index]: [
						top,
						left,
						chartGraphRef.current.clientHeight,
						chartGraphRef.current.clientWidth
					]
				};
			});
		},
		[ chartGraphRef ]
	);

	useEffect(
		() => {
			const chartGraph = document.getElementsByClassName('chartGraph' + index)[0];
			const chartDiv = document.createElement('div');
			const chartElement = chartGraph.appendChild(chartDiv);
			const chart = createChart(chartElement, { width: 600, height: 300 });
			const areaSeries = chart.addAreaSeries({
				topColor: 'rgba(21, 146, 230, 0.4)',
				bottomColor: 'rgba(21, 146, 230, 0)',
				lineColor: 'rgba(21, 146, 230, 1)',
				lineStyle: 1,
				lineWidth: 2,
				crosshairMarkerVisible: true,
				crosshairMarkerRadius: 3
			});
			//customize the chart
			chart.applyOptions({
				localization: {
					dateFormat: 'dd/MM/yy'
				},
				priceScale: {
					position: 'left'
				},
				timeScale: {
					fixLeftEdge: true,
					lockVisibleTimeRangeOnResize: true
				},
				watermark: {
					text: 'trading'
				},
				layout: {
					backgroundColor: 'white'
				}
			});
			areaSeries.setData(dataSet.data.map((item) => ({ ...item, time: item.date })));
			return () => {
				chartGraph.removeChild(chartElement);
			};
		},
		[ dataSet ]
	);
	function widgetSourceLabel(sourceId, sourceIndex) {
		const dataSet = dataSets[sourceId];
		const dataId = dataIds[sourceIndex];
		const stockData = dataSet.stockData[dataId];
		return `${dataSet.name} -- ${stockData.name}`;
	}
	const getChartStyle = (top, left) => ({
		top,
		left,
		cursor: 'move',
		height: '400px',
		width: '32%',
		position: 'absolute',
		border: '1px solid lightgrey'
	});
	return (
		<div ref={chartGraphRef} style={getChartStyle(top, left)}>
			<div className={'chartGraph' + index} ref={drag}>
				<Select value={graphSourceId} onChange={(event) => changeGraphSource(index, event.target.value)}>
					{widgetDataSources.map((sourceId, i) => (
						<MenuItem key={'widgetSourceMenu' + i} value={i}>
							<Chip label={`Widget-${i} `} size="small" /> {widgetSourceLabel(sourceId, i)}
						</MenuItem>
					))}
				</Select>
				<IconButton classes={{ root: styles.addNewDataChart }} onClick={addGraphWidget}>
					<AddCircleIcon />
				</IconButton>
			</div>
		</div>
	);
}
