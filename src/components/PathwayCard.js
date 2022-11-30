import React, { useState, useEffect, useContext, useRef } from 'react'
import styles from '../styles/PathwayCard.module.css'
import ProgressBar from './ProgressBar'
import RoundButton from './RoundButton';
import PlannerContext from '../PlannerContext'
import PathwayCourse from './PathwayCourse';
import AddCourseButton from './AddCourseButton';
import PathwayCourseItem from './PathwayCourseItem';

const PathwayCard = ({ pathway }) => {

    const [percentComplete, setPercentComplete] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [inputVisible, setInputVisible] = useState(false);
    const [courseListVisible, setCourseListVisible] = useState(false);
    const [inputText, setInputText] = useState(pathway.name);
    const [refresh, setRefresh] = useState(false);

    const plannerContext = useContext(PlannerContext);
    const pathwayInput = useRef();

    const removeFromPathways = () => {
        plannerContext.setPathwaysData(plannerContext.pathwaysData.filter(
            (item) => item.name !== pathway.name
        ));
    };

    const refreshCard = () => {
        setRefresh(!refresh);
    };

    // Editing pathway name
    const updateInputText = (event) => {
        setInputText(event.target.value);
    };

    const editPathwayName = () => {
        setInputVisible(true);
        setTimeout(() => {
            pathwayInput.current.focus();
        }, 1);
    };

    const commitPathwayName = () => {
        if(inputText === "") return;

        const idx = plannerContext.pathwaysData.findIndex(pathwayItem => pathwayItem.name === pathway.name);
        const newPathwaysData = plannerContext.pathwaysData;
        newPathwaysData[idx].name = inputText;
        pathway.name = inputText;
        plannerContext.setPathwaysData(newPathwaysData);
        setInputVisible(false);
        refreshCard();
    };

    // Calculating total number of credits for the pathway
    useEffect(() => {
        let credits = 0;
        for(let i = 0; i < pathway.courses.length; i++) {
            credits += pathway.courses[i].credits;
        }

        setTotalCredits(credits);
    }, [ pathway.courses ]);

    // Calculating percentage completion
    useEffect(() => {
        let registered_credits = 0;

        pathway.courses.forEach(course => {
            if(plannerContext.getRegistered(course.crn) === true) {
                registered_credits += course.credits;
            }
        });
        if(totalCredits !== 0) {
            const progress = 100*(registered_credits/totalCredits);
            setPercentComplete(progress);
            plannerContext.setProgress({ name: pathway.name, progress: progress });
        } else {
            setPercentComplete(0);
            plannerContext.setProgress({ name: pathway.name, progress: 0 });
        }

    }, [ plannerContext, pathway, totalCredits ]);

    // Toggling course list visibility 
    const toggleCourseList = () => {
        setCourseListVisible(!courseListVisible);
    };

    return (
        <div className={styles.container}>
            {inputVisible
                ?
                <div className={styles.header}>
                    <input className={styles.input} type="text" value={inputText}
                        ref={pathwayInput}
                        spellCheck={false}
                        onChange={updateInputText}
                        onKeyDown={(event) => {if(event.key === "Enter") { commitPathwayName(); }}}
                        onSubmit={commitPathwayName}
                        onBlur={commitPathwayName}/>
                    <RoundButton 
                        name="minus" 
                        onClick={removeFromPathways} 
                        tooltip="Remove"
                        variant={2}/>
                </div>
                :
                <div className={styles.header}>
                    <div className={styles.name} onClick={editPathwayName} title={pathway.name}>{
                        (pathway.name.length > 16) ? pathway.name.slice(0, 16) + " ..." : pathway.name}</div>
                    <RoundButton 
                        name="minus" 
                        onClick={removeFromPathways} 
                        tooltip="Remove"
                        variant={2}/>
                </div>
            }
            <div className={styles.info_header}>
                <h5 className={styles.course_section}>COURSES</h5>
                <h5 className={styles.course_section}>{totalCredits + " CREDITS"}</h5>
            </div>
            {
                pathway.courses.map(
                    (course) => <PathwayCourse 
                                        course={course} 
                                        pathway_name={pathway.name}
                                        refresh={refreshCard}
                                        key={course.code}/>
                )
            }
            <AddCourseButton toggleCourseList={toggleCourseList}/>
            <div className={courseListVisible ? styles.course_list : styles.course_list_hidden}>
                {
                    plannerContext.wishlistData
                    .filter(wishlistCourse => {
                        let toInclude = true;
                        pathway.courses.forEach(pathwayCourse => {
                            if(pathwayCourse.crn === wishlistCourse.crn) {
                                toInclude = false;
                            }
                        })
                        return toInclude;
                    })
                    .map((course) => <PathwayCourseItem 
                                        course={course} 
                                        pathway={pathway} 
                                        key={course.code} 
                                        refresh={refreshCard}/>)
                }
            </div>

            <div className={styles.spacer}/>
            <div className={styles.progress}>
                <ProgressBar text="Progress" num={percentComplete} den={100} variant="%"/>
                <div className={styles.progress_text}>{(percentComplete).toFixed(2) +  " %"}</div>
            </div>
        </div>
    )
}

export default PathwayCard;
