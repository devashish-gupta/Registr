import React from 'react'
import { Dropdown, TextInput, Button, RecentPlanItem } from '../components'
import { useState, useRef, useContext, useEffect } from 'react'
import styles from '../styles/Welcome.module.css'
import { useNavigate } from 'react-router'

// Activity indicator
import Sentry from "react-activity/dist/Sentry";
import "react-activity/dist/Sentry.css";

import { parseCourseFile, getCourseInfoByCode } from '../Parser'
import GlobalContext from '../GlobalContext'

// Dummy plans for testing
// const recentplans = [
//     {
//         name: "Registration Plan",
//         semester: "Fall",
//         year: 2022,
//         major: "Robotics",
//         lmod: "Jun 2, 2022",
//         time: "2:35 pm",
//         file: {},
//         courses: [],
//         classified_courses: {},
//         wishlist: {},
//         stats: {},
//         pathways: {}
//     }, 
//     {
//         name: "Backup Plan",
//         semester: "Spring",
//         year: 2023,
//         major: "Robotics",
//         lmod: "Jun 17, 2022",
//         time: "5:15 am",
//         file: {},
//         courses: [],
//         classified_courses: {},
//         wishlist: {},
//         stats: {},
//         pathways: {}
//     },
//     {
//         name: "Registration_1 Plan",
//         semester: "Fall",
//         year: 2023,
//         major: "Robotics",
//         lmod: "Aug 4, 2022",
//         time: "5:24 am",
//         file: {},
//         courses: [],
//         classified_courses: {},
//         wishlist: {},
//         stats: {},
//         pathways: {}
//     }, 
//     {
//         name: "Backup_1 Plan",
//         semester: "Spring",
//         year: 2022,
//         major: "Robotics",
//         lmod: "Mar 5, 2023",
//         time: "3:18 pm",
//         file: {},
//         courses: [],
//         classified_courses: {},
//         wishlist: {},
//         stats: {},
//         pathways: {}
//     }
// ]

const Welcome = ({ setPlan }) => {

    const globalContext = useContext(GlobalContext);

    // Middle section states
    const [semester, setSemester] = useState(globalContext.semesterTypes[0]);
    const [year, setYear] = useState("");
    const [major, setMajor] = useState("");
    const [campus, setCampus] = useState(globalContext.campuses[0])
    const [courseFileName, setCourseFileName] = useState("");
    const [courseFile, setCourseFile] = useState({});
    const [clearFields, setClearFields] = useState(true);
    const [yearInvalid, setYearInvalid] = useState({val: false, reason: ""});
    const [fileInvalid, setFileInvalid] = useState({val: false, reason: ""});
    const [isBusy, setIsBusy] = useState(false); // for activity indicator

    // Right section states
    const [recentPlans, setRecentPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(-1);
    const [deleteActive, setDeleteActive] = useState(false);
    const [renameActive, setRenameActive] = useState(false);

    const fileInput = useRef(); // for the underlying file <input> field
    const navigate = useNavigate();

    // Middle section methods
    // Reset all fields
    const resetInputs = () => {
        setSemester(globalContext.semesterTypes[0]);
        setYear(0);
        setMajor("");
        setClearFields(!clearFields);
    };

    // To open the file upload dialogue
    const openFileDialog = () => {
        fileInput.current.click();
    }

    // setting the course file name upon selection
    const setCourseFileText = (event) => {
        setCourseFileName(event.target.files[0].name);
        setCourseFile(event.target.files[0])
        // parseCourseFile(event.target.files[0]);
    }

    // Validate year
    const validateYear = () => {
        setYearInvalid({val: false, reason: ""});
        const date = new Date(Date.now());
        const currentYear = date.toLocaleString("default", { year: 'numeric' });

        if(year.length === 0) { setYearInvalid({val: true, reason: "Year is empty"}); return false; }
        if(isNaN(year)) { setYearInvalid({val: true, reason: "Year should be numeric"}); return false; }
        if(year.length !== 4) { setYearInvalid({val: true, reason: "Year is not recent"}); return false; }
        if(Number(year) > Number(currentYear) + 1 || Number(year) < 2006) { setYearInvalid({val: true, reason: "Year not available"}); return false; }
        return true;
    }

    // File name validation
    const validateFilename = () => {
        setFileInvalid({val: false, reason: ""});
        if(courseFileName.length === 0) return true;
        const reg = new RegExp(".*.(doc|docx|txt)$");
        if(!reg.test(courseFileName)) { setFileInvalid({val: true, reason: "Not a valid file"}); return false; }
        return true;
    }

    // Handler for getting started, validates inputs and parses the course data
    const getStarted = async () => {
        const yearValid = validateYear();
        const fileValid = validateFilename();
        if(yearValid && fileValid) { 
            setIsBusy(true);
            const [courseCodes, classifiedCourseCodes] = await parseCourseFile(courseFile); // Comes from parser
            const courses = [];

            // Get info for all courses in parallel
            await Promise.all(
                courseCodes.map(async (code) => {
                    const [valid, fetchedCourse] = await getCourseInfoByCode({
                        courseCode: code, 
                        subCodes: globalContext.subjectCodes, 
                        year: year, 
                        semester: semester
                    });
                    if(valid) { 
                        courses.push(fetchedCourse);
                    }
                })
            );

            const classifiedCourses = classifiedCourseCodes; // For now

            // const courses = globalContext.courses.ai; // For testing Plan editor
            const timestamp = globalContext.getCurrentTimestamp();
            const lmod = timestamp.lmod;
            const time = timestamp.time;
            const plan = {
                name: "Untitled Plan",
                semester: globalContext.semesterTypes[semester],
                year: year,
                major: major,
                campus: campus,
                lmod: lmod,
                time: time,
                file: courseFileName,
                courses: courses,
                classified_courses: classifiedCourses,
                wishlist: [],
                stats: [],
                pathways: []
            }
            saveNewPlan(plan);
            setPlan(plan); // Setting the global active plan to be the current plan
            setIsBusy(false);
            navigate("/editor", { state: { direct_access: false }}); 
        }
    }

    // Method to add a new plan to the local storage
    const saveNewPlan = (plan) => {
        localStorage.removeItem(globalContext.PLAN_LOCATION);
        const newPlans = [...recentPlans, plan];
        localStorage.setItem(globalContext.PLAN_LOCATION, JSON.stringify(newPlans)); 
    }
    
    // Update local storage with latest data
    const syncPlans = () => {
        localStorage.removeItem(globalContext.PLAN_LOCATION);
        localStorage.setItem(globalContext.PLAN_LOCATION, JSON.stringify(recentPlans)); 
    }

    // Right section methods
    // Delete plan from the recent plans list
    const deletePlan = () => {
        setDeleteActive(false);
        if(selectedPlan === -1) return;
        const newPlans = recentPlans;
        newPlans.splice(selectedPlan, 1);
        setRecentPlans([...newPlans]);
    }

    // Clone a plan
    const clonePlan = () => {
        if(selectedPlan === -1) return;
        const newPlans = recentPlans;
        var newPlan = JSON.parse(JSON.stringify(newPlans[selectedPlan])); // Deep copy was needed

        const timestamp = globalContext.getCurrentTimestamp();
        newPlan.name += " Clone";
        newPlan.lmod = timestamp.lmod;
        newPlan.time = timestamp.time;
        setRecentPlans([...newPlans, newPlan]);
        syncPlans();
    }

    // Initiate plan renaming process
    const renamePlan = () => {
        if(selectedPlan === -1) return;
        setRenameActive(true);
        setDeleteActive(false);
    }

    // Modify and commit new plan name
    const commitPlanName = (name) => {
        const newPlans = recentPlans;
        newPlans[selectedPlan].name = name;
        const timestamp = globalContext.getCurrentTimestamp();
        newPlans[selectedPlan].lmod = timestamp.lmod;
        newPlans[selectedPlan].time = timestamp.time;
        setRecentPlans([...newPlans]);
    }

    // Load saved plans into recent plans list
    useEffect(() => {
        const plan_data = JSON.parse(localStorage.getItem(globalContext.PLAN_LOCATION));
        if(plan_data !== null) {
            setRecentPlans(plan_data);
        } else {
            setRecentPlans([]);
        }
    }, [ setRecentPlans, globalContext.PLAN_LOCATION ]);

    return (
        <div className={styles.body}>
            {/* Left Section */}
            <div className={styles.left_section}>
                <h1 className={styles.title}>
                    registr.
                </h1>
                {
                    (yearInvalid.val)
                    ?
                    <div className={styles.error}>{yearInvalid.reason}</div>
                    :
                    <div style={{ height: 29 }}/>
                }
                {
                    (fileInvalid.val)
                    ?
                    <>
                        <div style={{ height: 148 }}/>
                        <div className={styles.error}>{fileInvalid.reason}</div>
                    </>
                    :
                    <></>
                }
            </div>

            {/* Middle Section */}
            <div className={styles.middle_section}>
                <h2 className={styles.mid_title}>Create new plan</h2>

                <h5 className={styles.subtitle}>Choose semester</h5>
                <div className={styles.horizontal}>
                    <Dropdown 
                        options={globalContext.semesterTypes} 
                        def={0} 
                        setOption={setSemester} 
                        width={125}
                        clear={clearFields}/>
                    <TextInput 
                        placeholder="2XXX" 
                        updateText={setYear} 
                        width={75} 
                        margin={{ left: 15, right: 0 }}
                        clear={clearFields}
                        invalid={yearInvalid.val}
                        setInvalid={setYearInvalid}/>
                </div>

                <h5 className={styles.subtitle}>Choose major & campus</h5>
                <div className={styles.horizontal}>
                    <TextInput 
                        placeholder="Robotics" 
                        updateText={setMajor} 
                        width={180} 
                        margin={{ left: 0, right: 15 }}
                        clear={clearFields}/>
                    <Dropdown options={globalContext.campuses} def={0} setOption={setCampus} width={100} clear={clearFields}/>
                </div>

                <h5 className={styles.subtitle}>Upload a course offering</h5>
                <div className={styles.horizontal}>
                    <input type="file" accept=".doc,.docx,.txt" ref={fileInput} onChange={setCourseFileText} style={{ display: 'none' }}/>
                    <TextInput 
                        placeholder=".doc/.docx/.txt files" 
                        updateText={setCourseFileName} 
                        width={160} 
                        margin={{ left: 0, right: 15 }} 
                        clear={clearFields}
                        setText={courseFileName}
                        invalid={fileInvalid.val}
                        setInvalid={setFileInvalid}/>
                    <Button text="Choose file" onClick={openFileDialog} secondary={true}/>
                </div>

                <div className={styles.buttons}>
                    <Button text="Reset" onClick={resetInputs} secondary={true} style={{ marginRight: 15 }}/>
                    <Button text="Get started" onClick={getStarted}/>
                    {
                        (isBusy)
                        ?
                        <>
                            <Sentry color="#ffffff" speed={0.7} style={{ marginLeft: 15 }}/>
                            <div style={{ fontSize: 10, color: "#999999", marginTop: 8, marginLeft: 15 }}>Fetching courses...</div>
                        </>
                        :
                        <></>
                    }
                </div>

            </div>

            {/* Right Section  */}
            <div className={styles.right_section}>
                <h2 className={styles.right_title}>Recent plans</h2>
                <div className={styles.recentlist}>
                    {   
                        (recentPlans !== null) &&
                        recentPlans
                        .sort((plan1, plan2) => {
                            if(plan1.lmod !== plan2.lmod) {
                                return Date.parse(plan2.lmod) - Date.parse(plan1.lmod);
                            } else if(plan1.time !== plan2.time) {
                                return Date.parse(plan2.lmod + " " + plan2.time) - Date.parse(plan1.lmod + " " + plan1.time);
                            }
                            return 0;
                        })
                        .map((plan, idx) => {
                            return (
                                <div key={plan.name + plan.lmod 
                                + plan.time + plan.semester 
                                + String(plan.year)} onClick={() => {setRenameActive(false); setSelectedPlan(idx)}}> 
                                    <RecentPlanItem
                                        plan={plan}
                                        selected={idx === selectedPlan}
                                        setPlan={setPlan}
                                        syncPlans={syncPlans}
                                        renameActive={renameActive}
                                        setRenameActive={setRenameActive}
                                        updateName={commitPlanName}/>
                                </div>
                            )
                        })
                    }
                    {
                        (recentPlans.length === 0) 
                        ?
                        <div className={styles.placeholder}>
                            No saved plans here.
                        </div>
                        :
                        <></>
                    }
                </div>

                <div className={styles.buttons}>
                    <Button 
                        text="Rename" 
                        onClick={renamePlan} 
                        secondary={true} 
                        disabled={renameActive} 
                        tooltip="Select a plan to rename"
                        style={{ marginRight: 15 }}/>
                    <Button 
                        text="Delete" 
                        onClick={() => {if(selectedPlan !== -1) { setDeleteActive(true) } setRenameActive(false); }} 
                        secondary={true} 
                        disabled={deleteActive} 
                        tooltip="Select a plan to delete"/>
                    {
                        (deleteActive)
                        ?
                        <>
                            <Button 
                                text="Confirm" 
                                onClick={deletePlan} 
                                secondary={true} 
                                disabled={!deleteActive} 
                                style={{ marginLeft: 15 }}/>
                            <Button 
                                text="Cancel" 
                                onClick={() => {setRenameActive(false); setDeleteActive(false)}} 
                                secondary={true} 
                                disabled={!deleteActive} 
                                style={{ marginLeft: 15 }}/>
                        </>
                        :
                        <Button 
                            text="Clone" 
                            onClick={clonePlan} 
                            secondary={true} 
                            disabled={deleteActive} 
                            style={{ marginLeft: 15 }}/>
                    }
                </div>
            </div>
        </div>
    )
}

export default Welcome;
