import React, { useState, useEffect, useContext } from 'react'
import Button from './Button'
import styles from '../styles/Pathways.module.css'
// import ToggleButton from './ToggleButton'
import PathwayCard from './PathwayCard'
import PlannerContext from '../PlannerContext'

const Pathways = ({ data, setData, save, visible, toggleVisible }) => {
    const plannerContext = useContext(PlannerContext);

    const [refresh, setRefresh] = useState(false);

    // Retrieving saved pathways data
    useEffect(() => {
        const local_data = JSON.parse(localStorage.getItem("pathwaysData"));
        if(local_data !== null) {
            setData(local_data);
        }
    }, [ setData ]);

    const addPathway = () => {
        const num = plannerContext.pathwaysData.length + 1;
        const newPathway = {
            name: "Pathway " + num,
            progress: 0,
            courses: []
        }
        plannerContext.setPathwaysData(current => [...current, newPathway]);
    };

    const refreshPathways = () => {
        setRefresh(!refresh);
    };

    return (
        <div className={visible ? styles.main : styles.hidden_main}>
            <div className={styles.header}>
                <h4 className={styles.title} onClick={toggleVisible}>Your Pathways</h4>

                <Button text="New" onClick={addPathway}/>
                <div style={{ width: 15 }}/>
                <Button text="Save" onClick={save}/>
                <div style={{ flex: 1 }}/>

                <Button text="Refresh" onClick={refreshPathways}/>
            </div>
            <div className={styles.container}>
                {
                    data
                    .sort((pathway1, pathway2) => pathway2.progress - pathway1.progress)
                    .map((pathway) => <PathwayCard pathway={pathway} key={pathway.name}/>)
                }
            </div>
        </div>
    )
}

export default Pathways;
