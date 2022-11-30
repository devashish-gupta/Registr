import React, { useState, useContext, useEffect } from 'react'
import PlannerContext from '../PlannerContext'
import styles from '../styles/PathwayCourse.module.css'
import RoundButton from './RoundButton'

const PathwayCourse = ({ course, pathway_name, refresh }) => {

    const [isFoundational, setIsFoundational] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); // Course not registered for by default
    const [isHovered, setIsHovered] = useState(false);

    const plannerContext = useContext(PlannerContext);

    // Check if course is foundational
    useEffect(() => {
        if(course.code.slice(-1)[0] === "*") {
            setIsFoundational(true);
        } else {
            setIsFoundational(false);
        }
    }, [ course ]);

    // Check if course is registered
    useEffect(() => {
        if(plannerContext.wishlistStats.some(item => (course.crn.includes(item.crn) && item.registered === true))) {
            setIsRegistered(true);
        } else {
            setIsRegistered(false);
        }

    }, [ plannerContext.wishlistStats, course.crn ]);


    const removeFromPathway = () => {
        setTimeout(() => {              
            let newPathwaysData = plannerContext.pathwaysData;

            for(let i = 0; i < newPathwaysData.length; i++) {
                if(newPathwaysData[i].name === pathway_name) {
                    newPathwaysData[i].courses = newPathwaysData[i].courses.filter(
                        (courseItem) => courseItem.name !== course.name
                    )
                }
            }
            refresh();
            plannerContext.setPathwaysData(newPathwaysData);
        }, 100);
    };

    return (
        <div className={styles.unselectable}>
            <div className={
                isFoundational 
                ? (isRegistered 
                    ? styles.foundational_registered_container 
                    : styles.foundational_container) 
                : (isRegistered 
                    ? styles.registered_container 
                    : styles.container)}
                onMouseOver={() => {setIsHovered(true)}}
                onMouseOut={() => {setIsHovered(false)}}>

                <div className={styles.code}>{course.code}</div>
                <div className={styles.name}>{course.name}</div>
                <div style={{ flex: 1 }}/>
                
                {isHovered
                    ?
                    <RoundButton 
                        name="minus" 
                        onClick={removeFromPathway}
                        variant={5}
                        tooltip="Remove"/>
                    :
                    <div className={styles.placeholder}></div>
                }
            </div>
        </div>
    )
}

export default PathwayCourse;
