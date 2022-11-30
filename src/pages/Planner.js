import { SidePanel, Wishlist, Pathways } from '../components'
import PlannerContext from '../PlannerContext'
import { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import styles from '../styles/Planner.module.css'
import GlobalContext from '../GlobalContext'

// Planner data templates
// const wishlist = [
// 		// {
// 		//		 crn: 85786,
// 		//		 code: "CS 6476",
// 		//		 name: "Computer Vision",
// 		//		 credits: 3
// 		// },
// 		// {
// 		//		 crn: 93624,
// 		//		 code: "CS 4644",
// 		//		 name: "Deep learning",
// 		//		 credits: 3
// 		// }
// ]

// const wishliststats = [
// 		// {
// 		//		 crn: 85786,
//      //       code: "CS 6545"
// 		//		 inference: "",
// 		//		 cap_num: 0,
// 		//		 cap_den: 0,
// 		//		 wait_num: 0,
// 		//		 wait_den: 0,
// 		//		 registered: false
// 		// },
// 		// {
// 		//		 crn: 93624,
//      //       code: "CS 6545"
// 		//		 inference: "",
// 		//		 cap_num: 0,
// 		//		 cap_den: 0,
// 		//		 wait_num: 0,
// 		//		 wait_den: 0,
// 		//		 registered: false
// 		// }
// ]

// const pathways = [
// 		// {
// 		//		 name: "Pathway 1",
// 		//		 progress: 0,
// 		//		 courses: [
// 		//				 {
// 		//						 crn: 85786,
// 		//						 code: "CS 6476*",
// 		//						 name: "Computer Vision",
// 		//						 credits: 3 
// 		//				 },
// 		//				 {
// 		//						 crn: 93629,
// 		//						 code: "CS 7631",
// 		//						 name: "Multi-Robot Systems (New)",
// 		//						 credits: 3
// 		//				 }
// 		//		 ]
// 		// },
// 		// {
// 		//		 name: "Pathway 2",
// 		//		 progress: 0,
// 		//		 courses: [
// 		//				 {
// 		//						 crn: 85786,
// 		//						 code: "CS 6476*",
// 		//						 name: "Computer Vision",
// 		//						 credits: 3 
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7476",
// 		//						 name: "Advanced Computer Vision",
// 		//						 credits: 3
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7616",
// 		//						 name: "Pattern Recognition",
// 		//						 credits: 3
// 		//				 }
// 		//		 ]
// 		// },
// 		// {
// 		//		 name: "Pathway 3",
// 		//		 progress: 0,
// 		//		 courses: [
// 		//				 {
// 		//						 crn: 85786,
// 		//						 code: "CS 6476*",
// 		//						 name: "Computer Vision",
// 		//						 credits: 3 
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7476",
// 		//						 name: "Advanced Computer Vision",
// 		//						 credits: 3
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7616",
// 		//						 name: "Pattern Recognition",
// 		//						 credits: 3
// 		//				 }
// 		//		 ]
// 		// },
// 		// {
// 		//		 name: "Pathway 4",
// 		//		 progress: 0,
// 		//		 courses: [
// 		//				 {
// 		//						 crn: 85786,
// 		//						 code: "CS 6476*",
// 		//						 name: "Computer Vision",
// 		//						 credits: 3 
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7476",
// 		//						 name: "Advanced Computer Vision",
// 		//						 credits: 3
// 		//				 },
// 		//				 {
// 		//						 crn: 0,
// 		//						 code: "CS 7616",
// 		//						 name: "Pattern Recognition",
// 		//						 credits: 3
// 		//				 }
// 		//		 ]
// 		// }
// ]

const Planner = ({ plan, setPlan }) => {

	const globalContext = useContext(GlobalContext);
	const { state } = useLocation();
    const navigate = useNavigate();

    // Redirect to the welcome page if the user directly reaches editor
    useEffect(() => {
        if(state === null || state.direct_access === undefined) {
            navigate("/");
        }
    }, [ state, navigate ]);

	// Planner states
	const [wishlistData, setWishlistData] = useState(plan.wishlist); // Eventually set these from plan
	const [wishlistStats, setWishlistStats] = useState(plan.stats);
	const [pathwaysData, setPathwaysData] = useState(plan.pathways);
	const [isWishlistVisible, setIsWishlistVisible] = useState(true);

	// Helper for getting current stats of a course from the wishlist
	const getStats = (crn) => {
		const statsResults = wishlistStats.filter(item => crn.includes(item.crn));
		if(statsResults.length !== 0) {
			const stats = statsResults[0];
			return { 
				cap_num: stats.cap_num, 
				cap_den: stats.cap_den, 
				wait_num: stats.wait_num,
				wait_den: stats.wait_den,
				inference: stats.inference,
				registered: stats.registered
			}
		} else {
			return { 
				cap_num: 0, 
				cap_den: 0, 
				wait_num: 0,
				wait_den: 0,
				inference: "",
				registered: false
			}
		}
	};

	// Helper for checking if a course is marked registered
	const getRegistered = (crn) => {
		const statsResults = wishlistStats.filter(item => crn.includes(item.crn));
		if(statsResults.length !== 0) {
				const stats = statsResults[0];
				return stats.registered;
		} else {
				return false;
		}
	}

	// Helper for setting course stats using a stats object
	const setStats = ({ code, stats }) => {
		const idx = wishlistStats.findIndex(item => item.code.includes(code));
		const newDataItems = [...wishlistStats];
		let item = {...newDataItems[idx]};

		// Setting stats
		item.crn = stats.crn
		item.code = stats.code
		item.cap_num = stats.cap_num;
		item.cap_den = stats.cap_den;
		item.wait_num = stats.wait_num;
		item.wait_den = stats.wait_den;
		item.inference = stats.inference;
		item.registered = stats.registered;
		newDataItems[idx] = item;

		setWishlistStats(newDataItems);
	};

	// Helper for setting pathway progress
	const setProgress = ({ name, progress }) => {
		let newPathwaysData = pathwaysData;
		for(let i = 0; i < newPathwaysData.length; i++) {
			if(newPathwaysData[i].name === name) {
				newPathwaysData[i].progress = progress;
			}
		}
		setPathwaysData(newPathwaysData);
	};

	// Helper for setting the inference for a course
	const setInference = ({ crn, inference }) => {
		const idx = wishlistStats.findIndex(item => crn.includes(item.crn));
		const newDataItems = [...wishlistStats];
		let item = {...newDataItems[idx]};

		// Setting stats
		item.inference = inference;
		newDataItems[idx] = item;

		setWishlistStats(newDataItems);
	};

	// Helper for getting the inference of a course
	const getInference = (code) => { // crn is an array of crns for all sections for a course
		const idx = wishlistStats.findIndex(item => code.includes(item.code));
		if(idx === -1) return "";
		return wishlistStats[idx].inference;
	};

	// Planner context
	const plannerGlobals = {
		wishlistData,
		wishlistStats,
		pathwaysData,
		setWishlistData,
		setWishlistStats,
		setPathwaysData,
		getStats,
		getRegistered,
		setStats,
		setProgress,
		setInference,
		getInference
	}

	const toggleWishlistVisible = () => {
		setIsWishlistVisible(!isWishlistVisible);
	};

	// Method to save the plan to local storage, and update last updated timestamp
	const savePlan = () => {
		const planData = JSON.parse(localStorage.getItem(globalContext.PLAN_LOCATION));
		const foundPlan = planData.find((plan_) => 
			plan_.name === plan.name 
			&& plan_.lmod === plan.lmod 
			&& plan_.time === plan.time);
		
		if(foundPlan === null) return;
		const idx = planData.indexOf(foundPlan);

		// Preparing the updated plan
		var newPlan = JSON.parse(JSON.stringify(foundPlan)); // Deep copy
		const timestamp = globalContext.getCurrentTimestamp();
		newPlan.lmod = timestamp.lmod;
		newPlan.time = timestamp.time;
		newPlan.wishlist = wishlistData;
		newPlan.stats = wishlistStats;
		newPlan.pathways = pathwaysData; // For further review
		planData[idx] = newPlan;

		// Saving the updated plan
		localStorage.removeItem(globalContext.PLAN_LOCATION);
		localStorage.setItem(globalContext.PLAN_LOCATION, JSON.stringify(planData));
		setPlan(newPlan);
	}

	return (
		<PlannerContext.Provider value={plannerGlobals}>
			<div className={styles.main}>
				<SidePanel courseTree={plan.classified_courses} savePlan={savePlan}/>
				<Wishlist 
					data={wishlistData} 
					stats={wishlistStats}
					setData={setWishlistData}
					setStats={setWishlistStats}
					save={savePlan}
					visible={isWishlistVisible}
					toggleVisible={toggleWishlistVisible}/>

				<Pathways 
					data={pathwaysData} 
					setData={setPathwaysData}
					save={savePlan}
					visible={!isWishlistVisible}
					toggleVisible={toggleWishlistVisible}/>
			</div>
		</PlannerContext.Provider>
	);
}

export default Planner;
