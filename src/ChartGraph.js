import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { createChart } from 'lightweight-charts';
import ListSubheader from '@material-ui/core/ListSubheader';

export default function AddChartGraph(props) {
	const chartGraphRef = useRef();
	const { dataSet, positions, setWidgetPositions, initialPosition } = props;
	
	const [isDragging, drag] = useDrag({
		item: {
			type: 'chartGraph'
		},
		collect: monitor => ({
			isDragging:  !!monitor.isDragging()
		})
	});
	const position = positions.chartGraph;
	let top = position[0];
	let left = position[1];
	if(!top && !left){
		top = initialPosition[0];
		left = initialPosition[1];
	}

	useEffect(
		() => {
			setWidgetPositions((widget) => {
				return {
					...widget,
					chartGraph: [initialPosition[0], initialPosition[1], chartGraphRef.current.clientHeight, chartGraphRef.current.clientWidth]
				};
			});
		},
		[ chartGraphRef ]
	);
	console.log('widgets are', positions);
	useEffect(
		() => {
				const chartGraph = document.getElementsByClassName('chartGraph')[0];
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

	return (
		<div ref={chartGraphRef} style={{top, left, height: '400px', width: '32%', position: 'absolute', border: '1px solid lightgrey'}}>
			<div className='chartGraph' ref={drag}>
				<ListSubheader style={{cursor: 'move'}}>{dataSet.name} source: 'dataset1'</ListSubheader>
			</div>
		</div>
	);
}
