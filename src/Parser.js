// Course offerings parser

const getExtension = (name) => {
    const reg = new RegExp("\.[0-9a-z]+$");
    return name.match(reg)[0].slice(1);
}

const readTxtFile = async (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
    
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      })
}

const parseTxtFile = async (file) => {

    const text = await readTxtFile(file);
    const courses = [];
    const match_locations = [];
    const classifiedCourses = {};

    // Parsing courses
    const courseReg = new RegExp("[A-Z]+ ([0-9]{4}|[0-9]XXX)[A-Z]*", 'g');
    const matches = text.match(courseReg);
    if(matches.length !== 0) {
        matches.forEach(match => {
            courses.push(match);
            match_locations.push(match.index);
        });  
    } 
    return [[...new Set(courses)], classifiedCourses]; // Returning unique course codes
}

const parseDocxFile = async (file) => {

}

const parseDocFile = async (file) => {

}

const parseCourseFile = async (file) => {
    const ext = getExtension(file.name);
    switch(ext) {
        case 'txt': 
            return await parseTxtFile(file); 
        case 'docx': 
            return await parseDocxFile(file); 
        case 'doc': 
            return await parseDocFile(file); 
        default: break;
    }
    return [[], {}];
}

const getCourseInfoByCode = async ({ courseCode, subCodes, year, semester }) => {

    // Helper for invalid returns
    const Invalid = () => { 
        return [false, {}];
    }

    // Guard against multiple spaces in course code
    // const reg = new RegExp("\s+");
    // var code = courseCode.replace(reg, "\s");
    var code = courseCode;

    // Split into subject code and numeric code
    const codes = code.toUpperCase().split(" ");
    if(codes.length < 2) return Invalid();
    const [subCode, numCode, secCode = ""] = codes

    // Check validity of subject code
    const found = Object.keys(subCodes).find(code => code === subCode);
    if(found === undefined || found === null) return Invalid();

    // Basic number code check
    if(numCode.length < 4 || numCode.length > 5) return Invalid();
    
    // Send a request to OSCAR and determine validity
    // url (requires login): https://oscar.gatech.edu/bprod/bwskfcls.P_GetCrse?rsts=dummy&crn=dummy&term_in=202302&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=CSE&sel_crse=&sel_title=&sel_from_cred=&sel_to_cred=&sel_ptrm=%25&begin_hh=0&begin_mi=0&end_hh=0&end_mi=0&begin_ap=x&end_ap=y&path=1&SUB_BTN=Course+Search
    // url that doesn't require login:
    // https://oscar.gatech.edu/bprod/bwckctlg.p_display_courses?term_in=202302&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj=CSE&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25
    // url to directly get the course:
    // https://oscar.gatech.edu/bprod/bwckctlg.p_disp_course_detail?cat_term_in=202302&subj_code_in=CSE&crse_numb_in=6001

    var sem;
    switch(semester) {
        case 0: sem = "08"; break;
        case 1: sem = "02"; break;
        case 2: sem =  "05"; break;
        case 'Fall': sem = "08"; break;
        case 'Spring': sem = "02"; break;
        case 'Summer': sem =  "05"; break;
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

    const url = "/bprod/bwckctlg.p_disp_course_detail?cat_term_in=" + year + sem 
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
        code: courseCode.toUpperCase(),
        name: "",
        credits: 0
    };

    const parseBasicInfo = (text) => {
        var parser = new DOMParser();
        var html = parser.parseFromString(text, 'text/html');
        const courseTitle = html.querySelector(".nttitle"); // Is non-null when the course exists
        if(courseTitle == null) { return Invalid(); };

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
        console.log("section check")
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
    const infoUrl = "/bprod/bwckctlg.p_disp_listcrse?term_in=" + year + sem
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

    return [true, fetchedCourse];
}

export { parseCourseFile, getCourseInfoByCode };
