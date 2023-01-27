import {useEffect, useState} from 'react';
import fetchSuggestions from '../services/services';
import {useGlobalState} from '../state/index';
import {CREATE_SUGGESTION} from '../services/endpoints';
import {fetchSimulationDay} from '../services/services';

//mock suggestion data for pre-testing
// const suggestions = [
// 	{
// 		id: 360,
// 		supplierStatus: 'PENDING',
// 		demanderStatus: 'PENDING',
// 		supply: {
// 			id: 32,
// 			country: {
// 				id: 2,
// 				name: 'Japan',
// 				population: 12500000,
// 				vaccinationRate: 2.0724800000000023,
// 				dailyVaccineConsumption: 367000,
// 				vaccineStock: 371219000,
// 				dailyVaccineProduction: 9000000,
// 			},
// 			vaccineType: 'PFIZER',
// 			quantity: 1000,
// 			expirationDate: 1675585945000,
// 			unitPrice: 0,
// 		},
// 		demand: {
// 			id: 24,
// 			country: {
// 				id: 1,
// 				name: 'China',
// 				population: 7680000,
// 				vaccinationRate: 1.459895833333331,
// 				dailyVaccineConsumption: 100000,
// 				vaccineStock: 95328241120,
// 				dailyVaccineProduction: 2217035840,
// 			},
// 			vaccineType: 'BIONTECH',
// 			quantity: 100,
// 			urgency: 'URGENT',
// 		},
// 		quantity: 100,
// 	},
// 	{
// 		id: 356,
// 		supplierStatus: 'PENDING',
// 		demanderStatus: 'PENDING',
// 		supply: {
// 			id: 32,
// 			country: {
// 				id: 2,
// 				name: 'Japan',
// 				population: 12500000,
// 				vaccinationRate: 2.0724800000000023,
// 				dailyVaccineConsumption: 367000,
// 				vaccineStock: 371219000,
// 				dailyVaccineProduction: 9000000,
// 			},
// 			vaccineType: 'PFIZER',
// 			quantity: 1000,
// 			expirationDate: 1674584945000,
// 			unitPrice: 0,
// 		},
// 		demand: {
// 			id: 25,
// 			country: {
// 				id: 1,
// 				name: 'China',
// 				population: 7680000,
// 				vaccinationRate: 1.459895833333331,
// 				dailyVaccineConsumption: 100000,
// 				vaccineStock: 95328241120,
// 				dailyVaccineProduction: 2217035840,
// 			},
// 			vaccineType: 'BIONTECH',
// 			quantity: 100,
// 			urgency: 'URGENT',
// 		},
// 		quantity: 100,
// 	},
// 	{
// 		id: 352,
// 		supplierStatus: 'PENDING',
// 		demanderStatus: 'PENDING',
// 		supply: {
// 			id: 32,
// 			country: {
// 				id: 5,
// 				name: 'Japan',
// 				population: 12500000,
// 				vaccinationRate: 2.0724800000000023,
// 				dailyVaccineConsumption: 367000,
// 				vaccineStock: 371219000,
// 				dailyVaccineProduction: 9000000,
// 			},
// 			vaccineType: 'PFIZER',
// 			quantity: 1000,
// 			expirationDate: 1774584945000,
// 			unitPrice: 0,
// 		},
// 		demand: {
// 			id: 163,
// 			country: {
// 				id: 4,
// 				name: 'China',
// 				population: 7680000,
// 				vaccinationRate: 1.459895833333331,
// 				dailyVaccineConsumption: 100000,
// 				vaccineStock: 95328241120,
// 				dailyVaccineProduction: 2217035840,
// 			},
// 			vaccineType: 'PFIZER',
// 			quantity: 10,
// 			urgency: 'NORMAL',
// 		},
// 		quantity: 10,
// 	},
// ];
// const suggestions = [];

export default function Suggestion({onNextDay, setUpdated}) {
	const [country] = useGlobalState('country');
	const [id] = useGlobalState('id');

	//handle submit
	const defaultValues = {
		suggestionId: 0,
		countryId: id,
		approvalStatus: '',
		currentDate: '2023-01-26T19:06:36.364Z',
	};
	const [formValues] = useState(defaultValues);
	const handleSubmit = (event, sID, status) => {
		event.preventDefault();
		console.log('sID:', sID);
		console.log('FV', formValues);
		formValues.suggestionId = sID;
		formValues.approvalStatus = status;
		formValues.currentDate = new Date(currentDate).toISOString();

		fetch(CREATE_SUGGESTION, {
			method: 'POST',
			body: JSON.stringify(formValues),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => response.json())
			.then((response) => {
				console.log('Suggestion submitted:', formValues);
				console.log('Success:', JSON.stringify(response));
			})
			.catch((error) => {
				console.error('Error:', error);
			});
		//fetch suggestion data on submit
		fetchSuggestionData();
		showStatus(status, sID);
	};

	//fetch suggestions
	const [suggestionData, setSuggestionData] = useState([]);
	const [suggestionLength, setSuggestionLength] = useState([]);

	useEffect(() => {
		if (onNextDay) {
			setSuggestionLength([]);
			setSuggestionData([]);
			fetchSuggestionData();
			setUpdated(true);
		}
	}, [onNextDay]);

	useEffect(() => {
		fetchSuggestionData();
	}, []);

	const fetchSuggestionData = async () => {
		const result = await fetchSuggestions(id);
		setSuggestionData(result.data);
		setSuggestionLength(result.data.length);
		console.log('Country selected:', country, '\nCountry ID:', id);
		console.log('\nSuggestion data got:\n', suggestionData);
	};

	//display status of suggestion piece
	function showStatus(status, sID) {
		//refetch suggestion data, display the length of the new suggestion data in {suggestionLength} of function `showNotification(data)`
		fetchSuggestionData();
		// document.getElementById('msg').value = showNotification(suggestionData);
		if (status == 'DENIED') {
			document.getElementById(sID).remove();
		} else if (status == 'APPROVED') {
			// document.getElementById('msg').contentWindow.location.reload(true);
			// document.getElementById(sID + 'approveButton').hidden = true;
			// document.getElementById(sID + 'denyButton').hidden = true;
			// document.getElementById(sID + 'pending').classList.remove('hidden');
			console.log('af');
			// document.getElementById(sID + 'approveButton').setAttribute('disabled', 'disabled');
			// document.getElementById(sID + 'denyButton').setAttribute('disabled', 'disabled');
		}
	}

	//formate expiration date
	function formatDate(d) {
		let date = new Date(d);
		return date.toLocaleDateString('en-US');
	}

	//fetch current date
	const [currentDate, setCurrentDate] = useState([]);

	useEffect(() => {
		if (onNextDay) {
			setCurrentDate([]);
			fetchCurrentDateData([]);
			setUpdated(true);
		}
	}, [onNextDay]);

	useEffect(() => {
		fetchCurrentDateData();
	}, []);

	const fetchCurrentDateData = async () => {
		const result = await fetchSimulationDay();
		setCurrentDate(result.data);
	};
	// console.log('DDDD', currentDate);

	//determine role(supplier or demander) by matching global id with id in incoming data
	function supplyOrDemand(data, i) {
		let role = '';
		for (let i = 0; i < data.length; i++) {
			if (data[i].supply.country.id == id) {
				role = 'supplier';
			}
		}
		role = role == 'supplier' ? 'supplier' : 'demander';
		// console.log('role in supplyOrDemand:', role);
		if (role == 'demander') {
			// let i = 0;
			return (
				<div>
					<div className='grid grid-rows-1'>
						<div>
							<b>Expiration Date:</b>
						</div>
						<div>{formatDate(data[i].supply.expirationDate)}</div>
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}

	//display suggestion number msg
	let caseIndex = []; //store all index of supply/demand
	function showNotification(data) {
		let role = '';
		for (let i = 0; i < data.length; i++) {
			if (data[i].supply.country.id == id) {
				role = 'supplier';
			}
		}
		role = role == 'supplier' ? 'supplier' : 'demander';

		if (role == 'demander') {
			for (let i = 0; i < data.length; i++) {
				if (data[i].demand.country.id == id) {
					caseIndex.push(i);
				}
			}
		} else if (role == 'supplier') {
			for (let i = 0; i < data.length; i++) {
				if (data[i].supply.country.id == id) {
					caseIndex.push(i);
				}
			}
		}
		let caseNotEmpty = (
			<div>
				<div className='grid justify-items-center items-center'>You have {suggestionLength} suggestions:</div>
			</div>
		);
		let caseEmpty = <div className='grid justify-items-center items-center'>You have no suggestion.</div>;
		// console.log('Role:', role, '\nCaseLength:', caseLength);
		return caseIndex.length == 0 ? caseEmpty : caseNotEmpty;
	}

	//button options: Pending or not
	function deniedOrApproved(data, i, status) {
		let buttons1 = (
			<div className='grid float-right'>
				<div className='grid justify-items-center items-center mb-1'>
					<button
						id={data[i].id + 'approveButton'}
						type='submit'
						className='text-green-500 font-bold p-1 rounded-sm hover:bg-green-500 hover:text-white hover:ease-in transition duration-500 ease-out'
						name='approvalStatus'
						value={'APPROVED'}
						onClick={(e) => handleSubmit(e, data[i].id, 'APPROVED')}
					>
						Accept
					</button>
				</div>
				<div className='grid justify-items-center items-center mt-1'>
					<button
						id={data[i].id + 'denyButton'}
						type='submit'
						className='text-red-500 font-bold  p-1 rounded-sm hover:bg-red-500 hover:text-white hover:ease-in transition duration-500 ease-out'
						name='approvalStatus'
						value={'DENIED'}
						onClick={(e) => handleSubmit(e, data[i].id, 'DENIED')}
					>
						Decline
					</button>
				</div>
			</div>
		);
		let buttons2 = (
			<div className='grid float-right'>
				<div className='grid justify-items-center items-center mt-1'>
					<div
						id={data[i].id + 'pending'}
						className='text-orange-500 font-bold  p-1 rounded-sm disabled'
						value={'PENDING'}
					>
						Waiting...
					</div>
				</div>
			</div>
		);
		return status == 'PENDING' ? buttons1 : buttons2;
	}

	//Styling Suggestion piece
	function suggestionPiece(data, i) {
		let role = '';
		let roleName;

		for (let i = 0; i < data.length; i++) {
			if (data[i].supply.country.id == id) {
				role = 'demander';
				roleName = <div>{data[i].demand.country.name}</div>;
			} else if (data[i].demand.country.id == id) {
				role = 'supplier';
				roleName = <div>{data[i].supply.country.name}</div>;
			}
		}
		function roleStatus() {
			return role == 'demander' ? data[i].supplierStatus : data[i].demanderStatus;
		}
		// let a = roleStatus();
		let suggestion = (
			<form id={data[i].id}>
				<div className='grid grid-cols-2 border-2 border-main-100 rounded-xl p-5 m-5'>
					<div className='grid grid-rows-flex grid-cols-1'>
						<div className='capitalize grid grid-rows-flex'>
							<b>{role}:</b> {roleName}
						</div>
						<div>
							<b>Amount: </b> {data[i].quantity}
						</div>
						<div>{supplyOrDemand(data, i)}</div>
					</div>
					<div className='grid grid-rows-flex grid-cols-1'>{deniedOrApproved(data, i, roleStatus())}</div>
				</div>
			</form>
		);

		// if (role == 'demander' && data[i].demanderStatus == 'APPROVED') {
		// 	deniedOrApproved(data, i, 'PENDING');
		// } else if (role == 'supplier' && data[i].supplierStatus == 'APPROVED') {
		// 	deniedOrApproved(data, i, 'PENDING');
		// } else {
		// 	deniedOrApproved(data, i, '');
		// }

		return suggestion;
	}

	//show all suggestion pieces, ps. the map function below does not work, need a fix to use map
	function showSuggestion(data) {
		return (
			<>
				{(() => {
					const arr = [];
					for (let i = 0; i < caseIndex.length; i++) {
						arr.push(<div>{suggestionPiece(data, caseIndex[i])}</div>);
					}
					return arr;
				})()}
			</>
		);
	}

	return (
		<div>
			<div id='msg'>{showNotification(suggestionData)}</div>
			<div>{showSuggestion(suggestionData)}</div>
		</div>
	);
}
