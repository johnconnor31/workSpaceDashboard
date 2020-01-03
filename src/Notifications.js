import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
    maxWidth: 360,
    position: 'absolute',
		backgroundColor: theme.palette.background.paper,
		height: '400px',
		overflow: 'scroll',
		top: (props) => props.top || '',
		left: (props) => props.left || ''
	},
	inline: {
		display: 'inline'
  },
  subHeader: {
		backgroundColor: 'white',
		cursor: 'move'
  }
}));

export default function Notifications(props) {
  const notifRef = useRef();
	const { items, closeItem, positions, setWidgetPositions, initialPosition } = props;
	const [ isDragging, drag ] = useDrag({
		item: {
			type: 'notifications'
		},
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging()
		})
  });
  const position = positions.notifications;
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
					notifications:[initialPosition[0], initialPosition[1], notifRef.current.clientHeight, notifRef.current.clientWidth]
				};
			});
		},
		[ notifRef ]
	);
	const styles = useStyles({ top, left });
	return (
    <div style={{height: '400px', 'width': '20%'}} ref={notifRef}>
      <List
        classes={{ root: styles.root }}
        ref={drag}
        subheader={
          <ListSubheader component="div" classes={{ root: styles.subHeader }}>
            Notifications
          </ListSubheader>
        }
      >
        <NotifItem items={items} closeItem={closeItem} />
      </List>
    </div>
	);
}

function NotifItem(props) {
	const { items, closeItem } = props;
	function dismissItem(i) {
		return () => closeItem(i);
	}
	return items.length
		? items.map((item, i) => (
				<ListItem key={i}>
					<ListItemAvatar>
						<Avatar alt="Admin" src="./logo.svg" />
					</ListItemAvatar>
					<ListItemText primary="Ali Connors" secondary={<React.Fragment>{item.text}</React.Fragment>} />
					<IconButton onClick={dismissItem(i)}>
						<CloseIcon />
					</IconButton>
				</ListItem>
			))
		: 'No notifications';
}
