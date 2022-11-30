import GlobalContext from './GlobalContext'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Welcome, PlanEditor, Planner } from './pages'

const courses = {
  perception: [
      {
        crn: 85786,
        code: "CS 6476*",
        name: "Computer Vision",
        credits: 3 
      },
      {
        crn: 0,
        code: "CS 7476",
        name: "Advanced Computer Vision",
        credits: 3
      },
      {
        crn: 0,
        code: "CS 7616",
        name: "Pattern Recognition",
        credits: 3
      },
      {
        crn: 0,
        code: "CS 7636",
        name: "Computational Perception",
        credits: 3
      },
      {
        crn: 86896,
        code: "CS 7643",
        name: "Deep Learning",
        credits: 3
      },
      {
        crn: 0,
        code: "CS 7499",
        name: "3D Reconstruction and Mapping",
        credits: 3
      },
      {
        crn: 0,
        code: "CS 7626",
        name: "BHI Behavioral Imaging",
        credits: 3
      },
      {
        crn: 0,
        code: "ECE 6255",
        name: "Digital Processing of Speech Signals",
        credits: 3
      },
      {
        crn: 0,
        code: "ECE 6258",
        name: "Digital Image Processing",
        credits: 3
      },
      {
        crn: 0,
        code: "ECE 6273",
        name: "Pattern Recognition",
        credits: 3
      },
      {
        crn: 0,
        code: "ECE 6560",
        name: "PDEs in Image Processing and Computer Vision",
        credits: 3
      },
      {
        crn: 81668,
        code: "ME 6406*",
        name: "Machine Vision",
        credits: 3
      }
  ],
  ai: [
    {
      crn: 84101,
      code: "CS 6601*",
      name: "Artificial Intelligence",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 7612",
      name: "AI Planning",
      credits: 3
    },
    {
      crn: 93629,
      code: "CS 7631",
      name: "Multi-Robot Systems (New)",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 7640",
      name: "Learning in Autonomous Agents",
      credits: 3
    },
    {
      crn: 84249,
      code: "CS 7641",
      name: "Machine Learning",
      credits: 3
    },
    {
      crn: 86896,
      code: "CS 7643",
      name: "Deep Learning",
      credits: 3
    },
    {
      crn: 92102,
      code: "CS 7648",
      name: "Interactive Robot Learning (New)",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 8803",
      name: "Mobile Manipulation",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 7649",
      name: "Robot Intelligence: Planning",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 8803",
      name: "Computation and the Brain",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 8803",
      name: "Special Topics on Reinforcement Learning",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 8803",
      name: "Statistical Techniques in Robotics",
      credits: 3
    },
    {
      crn: 0,
      code: "ME 8813*",
      name: "Machine Learning Fundamentals for Mechanical Engineering",
      credits: 3
    }
  ],
  mechanics: [
    {
      crn: 0,
      code: "AE 6210*",
      name: "Advanced Dynamics I",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6211",
      name: "Advanced Dynamics II",
      credits: 3
    },
    {
      crn: 90566,
      code: "AE 6230",
      name: "Structural Dynamics",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6263",
      name: "Flexible Multi-Body Dynamics",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6270",
      name: "Nonlinear Dynamics",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6250",
      name: "Advanced Flight Dynamics",
      credits: 3
    },
    {
      crn: 93585,
      code: "BMED 8813*",
      name: "Robotics",
      credits: 3
    },
    {
      crn: 89362,
      code: "CS 7496",
      name: "Computer Animation",
      credits: 3
    },
    {
      crn: 89619,
      code: "ME 6705",
      name: "Introduction to Mechatronics",
      credits: 4
    },
    {
      crn: 0,
      code: "ME 6407*",
      name: "Robotics",
      credits: 3
    },
    {
      crn: 80044,
      code: "ME 6441*",
      name: "Dynamics of Mechanical Systems",
      credits: 3
    },
    {
      crn: 0,
      code: "ME 6442",
      name: "Vibration of Mechanical Systems",
      credits: 3
    },
    {
      crn: 93053,
      code: "ME 7442",
      name: "Vibration of Continuous Systems",
      credits: 3
    },
    {
      crn: 82094,
      code: "PHYS 6101*",
      name: "Classical Mechanics",
      credits: 3
    },
    {
      crn: 87287,
      code: "PHYS 4142",
      name: "Statistical Mechanics",
      credits: 3
    },
    {
      crn: 0,
      code: "PHYS 7224",
      name: "Nonlinear Dynamics",
      credits: 3
    },
    {
      crn: 0,
      code: "PHYS 8843",
      name: "Wearable Robotics (New)",
      credits: 3
    }
  ],
  control: [
    {
      crn: 0,
      code: "AE 6252",
      name: "Smart Structure Control",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6504",
      name: "Modern Methods of Flight Control",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6505",
      name: "Kalman Filtering",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6506",
      name: "Guidance and Navigation",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6511",
      name: "Optimal Guidance and Control",
      credits: 3
    },
    {
      crn: 85733,
      code: "AE 6530*",
      name: "Multivariable Linear Systems and Control",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6531",
      name: "Robust Control I",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6532",
      name: "Robust Control II",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6534",
      name: "Control of AE Structures",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6580",
      name: "Nonlinear Control",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 8803",
      name: "Nonlinear Stochastic Optimal Control",
      credits: 3
    },
    {
      crn: 80492,
      code: "ECE 6550*",
      name: "Linear Systems and Controls",
      credits: 3
    },
    {
      crn: 0,
      code: "ECE 6551",
      name: "Digital Controls",
      credits: 3
    },
    {
      crn: 0,
      code: "ECE 6552",
      name: "Nonlinear Systems and Control",
      credits: 3
    },
    {
      crn: 0,
      code: "ECE 6553",
      name: "Optimal Control and Optimization",
      credits: 3
    },
    {
      crn: 0,
      code: "ECE 6554",
      name: "Adaptive Control",
      credits: 3
    },
    {
      crn: 93349,
      code: "ECE 6555",
      name: "Optimal Estimation",
      credits: 3
    },
    {
      crn: 0,
      code: "ECE 6558",
      name: "Stochastic Systems",
      credits: 3
    },
    {
      crn: 87284,
      code: "ECE 6563",
      name: "Networked Control (New)",
      credits: 3
    },
    {
      crn: 85625,
      code: "ME 6401*",
      name: "Linear Control Systems",
      credits: 3
    },
    {
      crn: 0,
      code: "ME 6402",
      name: "Nonlinear Control Systems",
      credits: 3
    },
    {
      crn: 0,
      code: "ME 6403",
      name: "Digital Control Systems",
      credits: 3
    },
    {
      crn: 89450,
      code: "ME 6404",
      name: "Advanced Control System Design and Implementation",
      credits: 3
    }
  ],
  hri: [
    {
      crn: 93276,
      code: "AE 6551",
      name: "Cognitive Engineering",
      credits: 3
    },
    {
      crn: 0,
      code: "AE 6721*",
      name: "Evaluation of Human Integrated Systems",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 7633*",
      name: "Human-Robot Interaction",
      credits: 3
    },
    {
      crn: 92102,
      code: "CS 7648",
      name: "Interactive Robot Learning (New)",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 6455",
      name: "User Interface Design and Evaluation",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 6750",
      name: "Human-Computer Interact",
      credits: 3
    },
    {
      crn: 0,
      code: "CS 8803",
      name: "Computational Social Robotics",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 6011",
      name: "Cognitive Psychology",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 6014",
      name: "Sensation & Perception",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 6017",
      name: "Human Abilities",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 7101",
      name: "Engineering Psych I",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 7104",
      name: "Psychomotor & Cog Skill",
      credits: 3
    }
  ],
  natural: [
    {
      crn: 0,
      code: "CS 7492*",
      name: "Simulation of Biology",
      credits: 3
    },
    {
      crn: 0,
      code: "PHYS 8814",
      name: "Special Topics: Neurophysics",
      credits: 3
    },
    {
      crn: 0,
      code: "PHYS 4854",
      name: "Special Topics: Physics of Living Systems",
      credits: 3
    },
    {
      crn: 80389,
      code: "PSYC 6011",
      name: "Cognitive Psychology",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 6014",
      name: "Sensation & Perception",
      credits: 3
    },
    {
      crn: 0,
      code: "PSYC 6017",
      name: "Human Abilities",
      credits: 3
    }
  ],
  other: [
    {
      crn: 84797,
      code: "ME 7785",
      name: "Intro to Robotics Research",
      credits: 3
    },
    {
      crn: 89596,
      code: "ME 7741",
      name: "Robotics Professional Preparation",
      credits: 1
    }
  ]
}

const plan = {
  name: "Default Plan",
  semester: "Spring",
  year: 2023,
  major: "Robotics",
  lmod: "Mar 5, 2023",
  time: "3:18 pm",
  file: {},
  courses: Object.values(courses).flat(), // Contains courses classified according to core areas
  classified_courses: {},
  wishlist: {},
  stats: {},
  pathways: {}
}

const PLAN_LOCATION = "registr_plans";

const semesterTypes = [
  "Fall",
  "Spring",
  "Summer"
]

const campuses = [
  "Altanta",
  "Lorraine",
  "Shenzen",
  "Online"
]


const subjectCodes = { // List of all valid subject codes
  "ACCT": "Accounting",
  "AE": "Aerospace Engineering",
  "AS": "Air Force Aerospace Studies",
  "APPH": "Applied Physiology",
  "ASE": "Applied Systems Engineering",
  "ARBC": "Arabic",
  "ARCH": "Architecture",
  "BIOS": "Biological Sciences",
  "BIOL": "Biology",
  "BMEJ": "Biomed Engr/Joint Emory PKU",
  "BMED": "Biomedical Engineering",
  "BMEM": "Biomedical Engr/Joint Emory",
  "BCP": "Bldg Construction-Professional",
  "BC": "Building Construction",
  "CETL": "Center Enhancement-Teach/Learn",
  "CHBE": "Chemical & Biomolecular Engr",
  "CHEM": "Chemistry",
  "CHIN": "Chinese",
  "CP": "City Planning",
  "CEE": "Civil and Environmental Engr",
  "COA": "College of Architecture",
  "COE": "College of Engineering",
  "COS": "College of Sciences",
  "CX": "Computational Mod, Sim, & Data",
  "CSE": "Computational Science & Engr",
  "CS": "Computer Science",
  "COOP": "Cooperative Work Assignment",
  "UCGA": "Cross Enrollment",
  "EAS": "Earth and Atmospheric Sciences",
  "ECON": "Economics",
  "ECEP": "Elect & Comp Engr-Professional",
  "ECE": "Electrical & Computer Engr",
  "ENGL": "English",
  "FS": "Foreign Studies",
  "FREN": "French",
  "GT": "Georgia Tech",
  "GTL": "Georgia Tech Lorraine",
  "GRMN": "German",
  "GMC": "Global Media and Cultures",
  "HS": "Health Systems",
  "HEBW": "Hebrew",
  "HIN": "Hindi",
  "HIST": "History",
  "HTS": "History, Technology & Society",
  "ISYE": "Industrial & Systems Engr",
  "ID": "Industrial Design",
  "INTA": "International Affairs",
  "IL": "International Logistics",
  "INTN": "Internship",
  "IMBA": "Intl Executive MBA",
  "IAC": "Ivan Allen College",
  "JAPN": "Japanese",
  "KOR": "Korean",
  "LS": "Learning Support",
  "LING": "Linguistics",
  "LMC": "Literature, Media & Comm",
  "MGT": "Management",
  "MOT": "Management of Technology",
  "MLDR": "Manufacturing Leadership",
  "MSE": "Materials Science & Engr",
  "MATH": "Mathematics",
  "ME": "Mechanical Engineering",
  "MP": "Medical Physics",
  "MSL": "Military Science & Leadership",
  "ML": "Modern Languages",
  "MUSI": "Music",
  "NS": "Naval Science",
  "NEUR": "Neuroscience",
  "NRE": "Nuclear & Radiological Engr",
  "OIE": "Office of International Educ",
  "PERS": "Persian",
  "PHIL": "Philosophy",
  "PHYS": "Physics",
  "POL": "Political Science",
  "PTFE": "Polymer, Textile and Fiber Eng",
  "PORT": "Portuguese",
  "PSYC": "Psychology",
  "PUBP": "Public Policy",
  "PUBJ": "Public Policy/Joint GSU PhD",
  "RUSS": "Russian",
  "SLS": "Serve, Learn, Sustain",
  "SOC": "Sociology",
  "SPAN": "Spanish",
  "SWAH": "Swahili",
  "VIP": "Vertically Integrated Project",
  "WOLO": "Wolof"
}

const getCurrentTimestamp = () => {
  const date = new Date(Date.now());
  const lmod = date.toLocaleString('default', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric' 
  });

  const time = date.toLocaleString('default', { 
    hour: 'numeric', 
    minute: 'numeric' 
  }).toLowerCase();

  return {lmod, time};
}

function App() {

  const [currentPlan, setCurrentPlan] = useState(plan);

  const globals = {
    courses,
    currentPlan,
    semesterTypes,
    campuses,
    subjectCodes,
    PLAN_LOCATION,
    getCurrentTimestamp,
    setCurrentPlan
  }
  return (
    <GlobalContext.Provider value={globals}>
      <Router>
        <Routes>
          <Route path='/' element={<Welcome setPlan={setCurrentPlan}/>}/>
          <Route path='/editor' element={<PlanEditor plan={currentPlan} setPlan={setCurrentPlan}/>}/>
          <Route path='/planner' element={<Planner plan={currentPlan} setPlan={setCurrentPlan}/>}/>
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}

export default App;
