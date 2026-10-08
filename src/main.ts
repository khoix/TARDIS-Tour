import { ROOMS } from './data/rooms';
import { renderRoomIndex } from './ui/roomIndex';
import './style.css';

const container = document.querySelector<HTMLElement>('#room-index');
if (!container) throw new Error('Missing #room-index container');
renderRoomIndex(container, ROOMS);
