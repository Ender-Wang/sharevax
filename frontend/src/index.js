/** defaults
 * import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

class Sidebar extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return <div className='sideBar'>Sidebar section</div>;
	}
}

class Header extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return <div className='header'>Header section</div>;
	}
}

class Map extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return <div className='map'>Map section</div>;
	}
}

class ShipmentDetail extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return <div className='shipmentDetail'>ShipmentDetail section</div>;
	}
}

class Index extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className='body'>
				<div className='sidebar'>
					<Sidebar>
						Sidebar
						<a href='#home'>Home</a>
						<a href='#history'>History</a>
					</Sidebar>
				</div>

				<div className='header'>
					<Header>
						Header
						<a href='#country'></a>
						<img src='#' alt='#' id='#' />
					</Header>
				</div>

				<div className='map'>
					<Map>
						Map
						<div id='currentMap'></div>
						<div id='mapSidebar'>
							<ul>
								<li id='currentTransport'></li>
								<li id='dailyNewCase'></li>
								<li id='dailyVaccinePorduction'></li>
								<li id='dailyVaccineConsumption'></li>
							</ul>
						</div>
					</Map>
				</div>

				<div className='shipmentDetail'>
					<ShipmentDetail>ShipmentDetail</ShipmentDetail>
					<table id='shipmentTable'>
						<th>Destination</th>
						<th>From</th>
						<th>Transit Time</th>
						<th>Vaccine</th>
						<th>Dose</th>
						<th>Remaining Transit Time</th>
						<th>Departure</th>
						<th>Estimated Arrival Date</th>
						<th>Current In</th>
						<th>Next Step</th>
						<th>Urgency</th>
						<tr>
							<td>USA</td>
							<td>Germany</td>
							<td>30 Days</td>
							<td>Nova</td>
							<td>10M</td>
							<td>30 Days</td>
							<td>01.09.2022</td>
							<td>30.09.2022</td>
							<td>Harbor A</td>
							<td>Harbor B</td>
							<td>Red</td>
						</tr>
					</table>
				</div>
			</div>
		);
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Index />);