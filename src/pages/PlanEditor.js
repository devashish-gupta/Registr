import { Button, ParsedCourseItem, TextInput, Dropdown, CoreAreaItem } from '../components'
import Icon from 'react-web-vector-icons'
import { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router'
import styles from '../styles/PlanEditor.module.css'
import GlobalContext from '../GlobalContext'

const PlanEditor = ({ plan, setPlan }) => {
    
    const globalContext = useContext(GlobalContext);
    const { state } = useLocation();
    const navigate = useNavigate();

    // Redirect to the welcome page if the user directly reaches editor
    useEffect(() => {
        if(state === null || state.direct_access === undefined) {
            navigate("/");
        }
    }, [ state, navigate ]);
    
    // Left section states
    const [yearInvalid, setYearInvalid] = useState({val: false, reason: ""});
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState(0);

    // Middle section states
    const [unclassifiedCourses, setUnclassifiedCourses] = useState((plan.courses === null) ? [] : plan.courses); // Unclassified courses
    const [selectedUnclassifiedCourse, setSelectedUnclassifiedCourse] = useState(-1);
    const [inputCourseCode, setInputCourseCode] = useState("");
    const [clearInput, setClearInput] = useState(false);
    const [courseCodeInvalid, setCourseCodeInvalid] = useState({val: false, reason: ""});
    const [renameActiveUnclassified, setRenameActiveUnclassified] = useState(false);
    const [deleteActiveUnclassified, setDeleteActiveUnclassified] = useState(false);
    
    // Right section states
    const [coreAreas, setCoreAreas] = useState((plan.classifiedCourses === null) ? [] : Object.keys(plan.classified_courses));
    const [selectedCoreArea, setSelectedCoreArea] = useState((Object.keys(plan.classified_courses).length >= 0) ? 0 : -1); // The index of the current core area selected
    const [classifiedCourses, setClassifiedCourses] = useState((plan.classifiedCourses === null) ? [] : Object.values(plan.classified_courses)); // Stores courses under core areas
    const [coreRenameActive, setCoreRenameActive] = useState(false);
    

    // Left section methods
    // To validate year
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

    // Method to update the season and year of a semester, for a plan
    const updateSemester = () => {
        const yearValid = validateYear();
        if(!yearValid) {
            setClearInput(!clearInput);
            return;
        }

        const newPlan = plan;
        newPlan.semester = globalContext.semesterTypes[semester];
        newPlan.year = year;

        // Pushing changes to local storage
        const recentPlans = JSON.parse(localStorage.getItem(globalContext.PLAN_LOCATION));
        if(recentPlans !== null) {
            const foundPlan = recentPlans.find(plan_ => (plan_.name === plan.name) 
                && (plan_.lmod === plan.lmod) 
                && (plan_.time === plan.time));

            const idx = recentPlans.indexOf(foundPlan);

            if(idx !== -1) {
                const newPlans = recentPlans;
                newPlans[idx] = newPlan;
                const timestamp = globalContext.getCurrentTimestamp();
                newPlans[idx].lmod = timestamp.lmod;
                newPlans[idx].time = timestamp.time;
                localStorage.removeItem(globalContext.PLAN_LOCATION);
                localStorage.setItem(globalContext.PLAN_LOCATION, JSON.stringify(newPlans));
            }
        }
    }

    // To go back home
    const goBackHome = () => {
        savePlan();
        navigate("/");
    }

    // Method to save plan to local storage, and update last updated timestamp
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
        newPlan.courses = unclassifiedCourses;
        newPlan.classified_courses = getClassifiedCourses();
        const timestamp = globalContext.getCurrentTimestamp();
        newPlan.lmod = timestamp.lmod;
        newPlan.time = timestamp.time;
        planData[idx] = newPlan;

        // Saving the updated plan
        localStorage.removeItem(globalContext.PLAN_LOCATION);
        localStorage.setItem(globalContext.PLAN_LOCATION, JSON.stringify(planData));
        setPlan(newPlan);
    }

    // Middle section methods
    // Add a course to the selected core area
    const addCourseToCoreArea = ({ course, idx }) => {
        if(selectedCoreArea === -1) return;
        const newClassifiedCourses = JSON.parse(JSON.stringify(classifiedCourses));
        newClassifiedCourses[selectedCoreArea] = [...newClassifiedCourses[selectedCoreArea], course];
        setClassifiedCourses(newClassifiedCourses);

        // Removing the course from unclassified list
        const newUnclassifiedCourses = unclassifiedCourses;
        newUnclassifiedCourses.splice(idx, 1);
        setUnclassifiedCourses(newUnclassifiedCourses);
    }

    const removeCourseFromCoreArea = ({ course, idx }) => {
        const newClassifiedCourses = classifiedCourses;
        const removedCourse = newClassifiedCourses[selectedCoreArea][idx];
        
        // Removing the course from classified and adding to unclassified
        newClassifiedCourses[selectedCoreArea].splice(idx, 1);
        setUnclassifiedCourses([...unclassifiedCourses, removedCourse]);
        setClassifiedCourses(newClassifiedCourses);
    }

    // Validate if a course exists/is offered/is on OSCAR
    const validateCourseCode = async (courseCode) => {
        setCourseCodeInvalid({val: false, reason: ""});

        // Helper for invalid returns
        const Invalid = (reason) => {
            setCourseCodeInvalid({val: true, reason: reason}); 
            return [false, {}];
        }

        // Guard against multiple spaces in course code
        const reg = new RegExp("/\s/g");
        var code = courseCode.replace(reg, "\s");

        // Split into subject code and numeric code
        const codes = code.toUpperCase().split(" ");
        if(codes.length < 2) return Invalid("Incorrect format");
        const [subCode, numCode, secCode = ""] = codes

        // Check validity of subject code
        const found = Object.keys(globalContext.subjectCodes).find(code => code === subCode);
        if(found === undefined || found === null) return Invalid("Subject code doesn't exist");

        // Basic number code check
        if(numCode.length < 4 || numCode.length > 5) return Invalid("Incorrect numeric code length");
        
        // Send a request to OSCAR and determine validity
        // url (requires login): https://oscar.gatech.edu/bprod/bwskfcls.P_GetCrse?rsts=dummy&crn=dummy&term_in=202302&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=CSE&sel_crse=&sel_title=&sel_from_cred=&sel_to_cred=&sel_ptrm=%25&begin_hh=0&begin_mi=0&end_hh=0&end_mi=0&begin_ap=x&end_ap=y&path=1&SUB_BTN=Course+Search
        // url that doesn't require login:
        // https://oscar.gatech.edu/bprod/bwckctlg.p_display_courses?term_in=202302&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj=CSE&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25
        // url to directly get the course:
        // https://oscar.gatech.edu/bprod/bwckctlg.p_disp_course_detail?cat_term_in=202302&subj_code_in=CSE&crse_numb_in=6001

        var sem;
        switch(plan.semester) {
            case "Fall": sem = "08"; break;
            case "Spring": sem = "02"; break;
            case "Summer": sem =  "05"; break;
            default: break;
        }
        // Requires login
        // const url = "/bprod/bwskfcls.P_GetCrse?rsts=dummy&crn=dummy&term_in="
        //     + plan.year + sem + "&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj="
        //     + subCode + "&sel_crse=&sel_title=&sel_from_cred=&sel_to_cred=&sel_ptrm=%25&begin_hh=0&begin_mi=0&end_hh=0&end_mi=0&begin_ap=x&end_ap=y&path=1&SUB_BTN=Course+Search";

        // Gets a list of courses for a subject and term
        // const url = "/bprod/bwckctlg.p_display_courses?term_in=" + plan.year + sem
        //     + "&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj="
        //     + subCode + "&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25"

        const url = "/bprod/bwckctlg.p_disp_course_detail?cat_term_in=" + plan.year + sem 
            + "&subj_code_in=" + subCode + "&crse_numb_in=" + numCode;

        const headers = new Headers({
            "Accept"       : "application/json",
            "Content-Type" : "application/json",
            "User-Agent"   : "Google Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Access-Control-Allow-Origin": "*"
        });

        // Fetched course info to be stored here
        const fetchedCourse = {
            crn: [],
            code: inputCourseCode.toUpperCase(),
            name: "",
            credits: 0
        };

        const parseBasicInfo = (text) => {
            var parser = new DOMParser();
            var html = parser.parseFromString(text, 'text/html');
            const courseTitle = html.querySelector(".nttitle"); // Is non-null when the course exists
            if(courseTitle == null) { return Invalid("Course doesn't exist"); };

            // Parsing course information
            // Name
            const chunks = courseTitle.innerHTML.split(" ");
            const specialReg = new RegExp("&amp;")
            const name_ = chunks.slice((secCode !== "") ? 4 : 3).join(" ").replace(specialReg, " & ");

            // Credits
            const creditReg = new RegExp(" +.*Credit hours"); 
            const desc = html.querySelector(".ntdefault").innerHTML;
            const creditLoc = desc.search(creditReg);
            const credits_ = parseInt(desc.slice(creditLoc + 4, creditLoc + 5));
            return [name_, credits_];
        }

        const resBasic = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        const textBasic = await resBasic.text();
        const infoBasic = parseBasicInfo(textBasic);
        if(infoBasic[0] !== false) {
            fetchedCourse.name = infoBasic[0];
            fetchedCourse.credits = infoBasic[1];
        } else {
            return [false, {}];
        }

        const parseDetailedInfo = (text) => {
            var crns = [];
            var parser = new DOMParser();
            const html = parser.parseFromString(text, 'text/html');
            const sectionLinks = html.querySelectorAll(".ddtitle > a");
        
            // Checking if any sections exist, i.e. if the course is being offered in the selected semester
            if(sectionLinks.length === 0) return Invalid("No sections exist");

            // pushing all section crns to courseInfo
            sectionLinks.forEach((link) => {
                const title = link.innerHTML;
                crns.push(parseInt(title.split(" - ")[1]));
            })

            return [true, crns];
        }

        // Detailed information url
        // https://oscar.gatech.edu/bprod/bwckctlg.p_disp_listcrse?term_in=202302&subj_in=CSE&crse_in=6230&schd_in=%
        const infoUrl = "/bprod/bwckctlg.p_disp_listcrse?term_in=" + plan.year + sem
            + "&subj_in=" + subCode + "&crse_in=" + numCode + "&schd_in=%"

        const resDetailed = await fetch(infoUrl, {
            method: 'GET',
            headers: headers
        })
        const textDetailed = await resDetailed.text();
        const infoDetailed = parseDetailedInfo(textDetailed);
        if(infoDetailed[0] !== false) {
            fetchedCourse.crn = infoDetailed[1];
        } else {
            return [false, {}];
        }

        // Final check to ensure the course has not been added already
        const allCourses = [...classifiedCourses.flat(), ...unclassifiedCourses];
        const foundInCourses = allCourses.find((course) => {return course.code === fetchedCourse.code 
            || course.code.slice(0, -1) === fetchedCourse.code});
        if(foundInCourses !== undefined) return Invalid("Course was already added");

        return [true, fetchedCourse];
    }

    // To validate and add a course to unclasssified list
    const addCourseToUnclassifiedList = async () => {
        if(inputCourseCode === "") return [false, {}]; // if course code is empty
        if(unclassifiedCourses.find((course) => course.code === inputCourseCode) !== undefined) return [false, {}]; // if course already exists in the course list

        const [valid, course] = await validateCourseCode(inputCourseCode);
        if(valid) {
            setUnclassifiedCourses([course, ...unclassifiedCourses]);
            setClearInput(!clearInput);
        }
    }
    
    // To rename an unclassified course
    const renameUnclassifiedCourse = () => {
        if(setSelectedUnclassifiedCourse === -1) return;
        setRenameActiveUnclassified(true);
        setDeleteActiveUnclassified(false);
    }

    // Modify and commit new unclassified course name
    const commitCourseName = (name) => {
        const newCourses = unclassifiedCourses;
        newCourses[selectedUnclassifiedCourse].name = name;
        setUnclassifiedCourses([...newCourses]);
    }

    // To delete course from unclassified course list
    const deleteCourseUnclassified = () => {
        setRenameActiveUnclassified(false);
        setDeleteActiveUnclassified(false);
        if(selectedUnclassifiedCourse === -1) return;
        const newCourses = unclassifiedCourses;
        newCourses.splice(selectedUnclassifiedCourse, 1);
        setUnclassifiedCourses([...newCourses]);
    }

    // Toggle if a course id foundational
    const markFoundational = () => {
        const newCourses = unclassifiedCourses;
        const code = newCourses[selectedUnclassifiedCourse].code;

        if(code.slice(-1)[0] === "*") { // Was already foundational
            newCourses[selectedUnclassifiedCourse].code = code.slice(0, -1);
        } else { // Was not foundational
            newCourses[selectedUnclassifiedCourse].code += "*";
        }
        setUnclassifiedCourses([...newCourses]);
    }

    // Right section methods
    // Add selected course to selected core area
    const addCoreArea = () => {
        setCoreAreas([...coreAreas, "New area"]);
        setClassifiedCourses([...classifiedCourses, []]);
        setSelectedCoreArea(coreAreas.length);
        renameCoreArea();
    }

    // Delete the selected core area
    const deleteCoreArea = () => {
        if(selectedCoreArea === -1) return;
        setCoreRenameActive(false);
        const newCoreAreas = coreAreas;
        const removedCourses = classifiedCourses[selectedCoreArea];
        const newClassifiedCourses = classifiedCourses;
        newCoreAreas.splice(selectedCoreArea, 1);
        newClassifiedCourses.splice(selectedCoreArea, 1);

        setCoreAreas([...newCoreAreas]);
        setClassifiedCourses(newClassifiedCourses);
        setSelectedCoreArea(0);
        
        // Adding all the removed courses to unclassified courses
        setUnclassifiedCourses([...unclassifiedCourses, ...removedCourses]); 
    }

    const renameCoreArea = () => {
        if(selectedCoreArea === -1) return;
        setCoreRenameActive(true);
        // setDeleteActive(false);
    }
    
    // Modify and commit new core area name
    const commitCoreAreaName = (name) => {
        const newCoreAreas = coreAreas;
        newCoreAreas[selectedCoreArea] = name;
        setCoreAreas([...newCoreAreas]);
    }

    // Returns the course classifications as an object
    const getClassifiedCourses = () => {
        const classifiedCourseObj = {};
        for(var i = 0; i < coreAreas.length; i++) {
            classifiedCourseObj[coreAreas[i]] = classifiedCourses[i];
        }
        return classifiedCourseObj;
    }

    // Proceed to planner
    const proceedToPlanner = () => {
        savePlan();
        navigate("/planner", { state: { direct_access: false } });
    }

    return (
        <div className={styles.body}>
            {/* Left Section */}
            <div className={styles.left_section}>
                <h1 className={styles.title}>
                    registr.
                </h1>
                <div className={styles.plan_details} title={plan.name}>
                    {
                        (plan.name.length < 10)
                        ?
                        plan.name + " | " + plan.semester + " " + plan.year
                        :
                        plan.name.slice(0, 10) + "... | " + plan.semester + " " + plan.year
                    }
                </div>

                <h5 className={styles.edit_subtitle}>Change semester</h5>
                <div className={styles.edit_plan}>
                    <Dropdown 
                        options={globalContext.semesterTypes} 
                        def={0} 
                        setOption={setSemester} 
                        width={95}
                        clear={clearInput}/>
                    <TextInput 
                        placeholder="2XXX" 
                        updateText={setYear} 
                        width={70} 
                        margin={{ left: 15, right: 0 }}
                        clear={clearInput}
                        invalid={yearInvalid.val}
                        setInvalid={setYearInvalid}/>
                </div>
                <div>
                    <Button text="Go" onClick={updateSemester} secondary={true} style={{ marginLeft: 10, marginRight: 15 }}/>
                    <Button text="Back to home" onClick={goBackHome} secondary={true} style={{ marginLeft: 0 }}/>
                </div>
                <Button text="Save plan" onClick={savePlan} secondary={true} style={{ width: "91%", marginTop: 15, marginLeft: 10 }}/>
            </div>

            {/* Middle Section */}
            <div className={styles.middle_section}>
                <div className={styles.horizontal}>
                    <h2 className={styles.mid_title}>Courses</h2>
                    <div className={styles.uncount}>{unclassifiedCourses.length + " unassigned courses"}</div>
                </div>
                <div className={styles.middle_subsection}>
                    <div className={styles.unclassified_courses}>
                    {
                        (unclassifiedCourses.length !== 0)
                        ?
                        unclassifiedCourses.map((course, idx) => 
                        <div key={course.name} onClick={() => { if(idx !== selectedUnclassifiedCourse) setRenameActiveUnclassified(false); 
                            setSelectedUnclassifiedCourse(idx) }}>
                            <ParsedCourseItem 
                                course={course}
                                selected={idx === selectedUnclassifiedCourse}
                                renameActive={renameActiveUnclassified}
                                setRenameActive={setRenameActiveUnclassified}
                                updateName={commitCourseName}
                                classified={false}
                                disabled={selectedCoreArea === -1 || coreAreas.length === 0}
                                onClick={() => { addCourseToCoreArea({ course, idx }) }}/>
                        </div>
                        ) 
                        :
                        <div className={styles.placeholder}>
                            No courses here.
                        </div>
                    }
                    </div>

                    <div className={styles.middle_buttons}>
                        <h5 className={styles.subtitle}>Enter a course code</h5>
                        <div className={styles.horizontal}>
                            <div className={courseCodeInvalid.val === true ? styles.error_msg : styles.hidden_error_msg}>{courseCodeInvalid.reason}</div>
                            <TextInput 
                                placeholder="For eg. CSE 6230" 
                                updateText={setInputCourseCode} 
                                width={212} 
                                margin={{ left: 0, right: 15 }} 
                                setText={inputCourseCode}
                                clear={clearInput}
                                invalid={courseCodeInvalid.val}
                                setInvalid={setCourseCodeInvalid}/>
                            <Button text="Add course" secondary={false} onClick={addCourseToUnclassifiedList}/>
                        </div>
                        <div className={styles.horizontal}>
                        {
                            (deleteActiveUnclassified)
                            ?
                            <>
                            <Button 
                                text="Delete" 
                                onClick={() => {}} 
                                secondary={true} 
                                disabled={true}
                                style={{ marginRight: 15, marginTop: 15 }}/>
                            <Button 
                                text="Confirm" 
                                onClick={deleteCourseUnclassified} 
                                secondary={true} 
                                disabled={false} 
                                style={{ marginRight: 15, marginTop: 15 }}/>
                            <Button 
                                text="Cancel" 
                                onClick={() => {setRenameActiveUnclassified(false); setDeleteActiveUnclassified(false)}} 
                                secondary={true} 
                                disabled={false} 
                                style={{ marginTop: 15 }}/>
                            </>
                            :
                            <>
                            <Button 
                                text="Rename" 
                                onClick={renameUnclassifiedCourse} 
                                secondary={true} 
                                disabled={renameActiveUnclassified} 
                                tooltip="Rename course"
                                disabledTooltip="Hit Enter to commit"
                                style={{ marginRight: 15, marginTop: 15 }}/>
                            <Button 
                                text="Delete" 
                                onClick={() => {if(selectedUnclassifiedCourse !== -1) { setDeleteActiveUnclassified(true) } setRenameActiveUnclassified(false); }} 
                                secondary={true} 
                                disabled={deleteActiveUnclassified}
                                style={{ marginRight: 15, marginTop: 15 }}/>
                            <Button 
                                text="Mark foundational" 
                                onClick={markFoundational} 
                                secondary={true} 
                                style={{ marginTop: 15 }}/>
                            </>
                        }
                    </div>
                    </div>
                </div>
            </div>

            {/* Middle Guide Icon Section */}
            <div className={styles.guide_icons} title="Assign courses to core areas">
                <Icon name="chevron-left" font="Feather" size={15} color='rgba(255, 255, 255, 0.6)'/>
                <Icon name="chevron-right" font="Feather" size={15} color='rgba(255, 255, 255, 0.6)'/>
            </div>

            {/* Right Section  */}
            <div className={styles.right_section}>
                <div className={styles.horizontal}>
                    <h2 className={styles.right_title}>Core areas</h2>
                    <div className={styles.instruction}>Define or edit core areas</div>
                </div>
                <div className={styles.right_container}>
                    <div className={styles.classified_courses}>
                    {
                        (selectedCoreArea !== -1 
                            && classifiedCourses.length !== 0 
                            && classifiedCourses[selectedCoreArea].length !== 0)
                        ?
                        classifiedCourses[selectedCoreArea].map((course, idx) => // Error here
                        <div key={course.name} onClick={() => { if(idx !== selectedUnclassifiedCourse) setRenameActiveUnclassified(false); }}>
                            <ParsedCourseItem 
                                course={course}
                                selected={false}
                                renameActive={renameActiveUnclassified}
                                setRenameActive={setRenameActiveUnclassified}
                                updateName={commitCourseName}
                                classified={true}
                                onClick={() => { removeCourseFromCoreArea({course, idx}) }}/>
                        </div>
                        ) 
                        :
                        <></>
                    }
                    {
                        (selectedCoreArea !== -1 
                            && classifiedCourses.length !== 0 
                            && classifiedCourses[selectedCoreArea].length === 0) 
                        ?
                        <div className={styles.placeholder}>
                            No courses for the selected core area.
                        </div>
                        :
                        <></>
                    }
                    </div>
                    <div className={styles.core_area_container}>
                        <div className={styles.core_areas}>
                        {
                            coreAreas.map((area, idx) => { return (
                                <CoreAreaItem
                                    key={area}  
                                    name={area}
                                    selected={idx === selectedCoreArea}
                                    renameActive={coreRenameActive}
                                    setRenameActive={setCoreRenameActive}
                                    updateName={commitCoreAreaName}
                                    onClick={() => { 
                                        setSelectedCoreArea(idx); 
                                        if(idx !== selectedCoreArea) {
                                            setCoreRenameActive(false) 
                                        }
                                    }}/>
                            )})
                        }
                        {
                            (coreAreas.length === 0)
                            ?
                            <div className={styles.core_placeholder}>Add a core area to begin</div>
                            :
                            <></>
                        }
                        </div>
                        <div className={styles.right_section_buttons}>
                            <div>
                                <Button 
                                    text="Add" 
                                    onClick={addCoreArea} 
                                    secondary={true} 
                                    disabled={false} 
                                    style={{ marginLeft: 15, marginTop: 15, width: 65 }}/>
                                <Button 
                                    text="Rename" 
                                    onClick={renameCoreArea} 
                                    secondary={true} 
                                    disabled={false} 
                                    style={{ marginLeft: 15, marginTop: 15, width: 95 }}/>
                            </div>
                            <div>
                                <Button 
                                    text="Delete" 
                                    onClick={deleteCoreArea} 
                                    secondary={true} 
                                    disabled={false} 
                                    style={{ marginLeft: 15, marginTop: 15 }}/>
                                <Button 
                                    text="Proceed" 
                                    onClick={proceedToPlanner} 
                                    disabled={false} 
                                    style={{ marginLeft: 15, marginTop: 15, width: 85 }}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlanEditor;
