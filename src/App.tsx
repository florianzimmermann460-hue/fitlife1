import { useEffect, useMemo, useState } from "react";
import {
  Activity, Apple, CalendarDays, Check, ChevronRight, CirclePlus,
  Dumbbell, Footprints, HeartPulse, Home, LayoutDashboard, Menu,
  Moon, MoreHorizontal, Play, Plus, Route, Settings, Sparkles,
  Target, TrendingUp, Utensils, Watch, X, Zap
} from "lucide-react";

type Page = "dashboard"|"calendar"|"training"|"activities"|"nutrition"|"health"|"supplements"|"stats"|"settings";
type Exercise = { id:string; name:string; sets:number; reps:number; weight:number };
type Workout = { id:string; name:string; description:string; exercises:Exercise[]; lastCompleted?:string };
type Supplement = { id:string; name:string; amount:string; taken:boolean; time:string };

const today = new Date();
const dateKey = today.toISOString().slice(0,10);

const initialWorkouts: Workout[] = [
  {id:"w1", name:"Ganzkörper A", description:"Kraft · 55 min", exercises:[
    {id:"e1",name:"Bankdrücken",sets:3,reps:10,weight:50},
    {id:"e2",name:"Latzug",sets:3,reps:10,weight:55},
    {id:"e3",name:"Beinpresse",sets:4,reps:12,weight:100},
    {id:"e4",name:"Bizepscurls",sets:3,reps:12,weight:12}
  ]},
  {id:"w2", name:"Ganzkörper B", description:"Kraft · 50 min", exercises:[
    {id:"e5",name:"Schulterdrücken",sets:3,reps:10,weight:30},
    {id:"e6",name:"Rudern",sets:3,reps:10,weight:50},
    {id:"e7",name:"Beinpresse",sets:4,reps:10,weight:110}
  ]}
];

const mockActivities = [
  {name:"Rheinrunde", type:"Radfahren", date:"Heute", distance:"28,4 km", duration:"1:14 h", elevation:"182 m"},
  {name:"Waldtour", type:"Wandern", date:"Gestern", distance:"9,8 km", duration:"2:07 h", elevation:"241 m"},
  {name:"Abendrunde", type:"Laufen", date:"24.08.", distance:"6,2 km", duration:"36 min", elevation:"54 m"}
];

function useStored<T>(key:string, initial:T):[T,(v:T)=>void] {
  const [value,setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? initial; } catch { return initial; }
  });
  useEffect(()=>localStorage.setItem(key,JSON.stringify(value)),[key,value]);
  return [value,setValue];
}

function App(){
  const [page,setPage] = useState<Page>("dashboard");
  const [sidebar,setSidebar] = useState(true);
  const [workouts,setWorkouts] = useStored<Workout[]>("fitlife-workouts",initialWorkouts);
  const [supplements,setSupplements] = useStored<Supplement[]>("fitlife-supplements",[
    {id:"s1",name:"Kreatin",amount:"5 g",taken:false,time:"11:00"},
    {id:"s2",name:"Ashwagandha",amount:"1 Portion",taken:false,time:"20:00"}
  ]);
  const [activeWorkout,setActiveWorkout] = useState<string|null>(null);

  const nav = [
    ["dashboard","Dashboard",LayoutDashboard],
    ["calendar","Kalender",CalendarDays],
    ["training","Training",Dumbbell],
    ["activities","Aktivitäten",Route],
    ["nutrition","Ernährung",Utensils],
    ["health","Gesundheit",HeartPulse],
    ["supplements","Supplements",Apple],
    ["stats","Statistiken",TrendingUp],
    ["settings","Einstellungen",Settings],
  ] as const;

  const supplementProgress = Math.round(supplements.filter(x=>x.taken).length / Math.max(supplements.length,1)*100);

  return <div className="app">
    <aside className={"sidebar "+(!sidebar?"collapsed":"")}>
      <div className="brand"><div className="brandmark"><Zap size={19}/></div>{sidebar && <div><b>FitLife</b><span>HUB</span></div>}</div>
      <div className="nav">{nav.map(([id,label,Icon])=>
        <button key={id} className={page===id?"navitem active":"navitem"} onClick={()=>setPage(id as Page)}>
          <Icon size={19}/>{sidebar && <span>{label}</span>}
        </button>)}</div>
      {sidebar && <div className="syncbox"><div className="syncdot"/><div><b>Demo-Modus</b><small>Integrationen vorbereitet</small></div></div>}
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="iconbtn" onClick={()=>setSidebar(!sidebar)}><Menu size={20}/></button>
        <div className="crumb">{nav.find(x=>x[0]===page)?.[1]}</div>
        <div className="topright"><span className="live"><span/> Daten lokal gespeichert</span><div className="avatar">FZ</div></div>
      </header>
      <div className="content">
        {page==="dashboard" && <Dashboard setPage={setPage} supplementProgress={supplementProgress} supplements={supplements} setSupplements={setSupplements}/>}
        {page==="calendar" && <CalendarPage setPage={setPage}/>}
        {page==="training" && <Training workouts={workouts} setWorkouts={setWorkouts} activeWorkout={activeWorkout} setActiveWorkout={setActiveWorkout}/>}
        {page==="activities" && <Activities/>}
        {page==="nutrition" && <Nutrition/>}
        {page==="health" && <Health/>}
        {page==="supplements" && <Supplements supplements={supplements} setSupplements={setSupplements}/>}
        {page==="stats" && <Stats/>}
        {page==="settings" && <SettingsPage/>}
      </div>
    </main>
  </div>
}

function Dashboard({setPage,supplementProgress,supplements,setSupplements}:{setPage:(p:Page)=>void;supplementProgress:number;supplements:Supplement[];setSupplements:(x:Supplement[])=>void}){
   const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/health/today?date=${dateKey}`)
      .then(r => r.json())
      .then(x => setHealthData(x.data))
      .catch(() => {});
  }, []);

  const steps = healthData?.steps != null
    ? Number(healthData.steps).toLocaleString("de-DE")
    : "—";

  const stepNumber = healthData?.steps != null
    ? Number(healthData.steps)
    : 0;

  const stepProgress = Math.min(Math.round(stepNumber / 10000 * 100), 100);
  const toggle=(id:string)=>setSupplements(supplements.map(s=>s.id===id?{...s,taken:!s.taken}:s));
  return <div>
    <div className="hero">
     <div>
  <div className="eyebrow">
    {new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).toUpperCase()}
  </div>
  <h1>Guten Abend 👋</h1>
  <p>Hier ist dein Überblick für heute.</p>
</div>
      <button className="primary" onClick={()=>setPage("training")}><Play size={17}/> Training starten</button>
    </div>
    <div className="grid statsgrid">
      <Metric
  icon={<Footprints/>}
  label="Schritte"
  value={steps}
  sub={`${stepProgress} % vom Ziel`}
/>
      <Metric icon={<Activity/>} label="Aktive Kalorien" value="612 kcal" sub="+8 % vs. Ø"/>
      <Metric icon={<Moon/>} label="Schlaf" value="7 h 48 min" sub="Gute Erholung"/>
      <Metric icon={<HeartPulse/>} label="Ø Puls" value="64 bpm" sub="Ruhe: 57 bpm"/>
    </div>
    <div className="grid twocol">
      <section className="card"><CardHead title="Tagesziele" action="Details" onClick={()=>setPage("nutrition")}/>
        <div className="goal"><div><b>Kalorien</b><span>1.842 / 2.300 kcal</span></div><Progress value={80}/></div>
        <div className="goal"><div><b>Protein</b><span>128 / 160 g</span></div><Progress value={80}/></div>
       <div className="goal">
  <div>
    <b>Schritte</b>
    <span>{steps} / 10.000</span>
  </div>
  <Progress value={stepProgress}/>
</div>
      </section>
      <section className="card"><CardHead title="Supplements" action="Alle" onClick={()=>setPage("supplements")}/>
        <div className="supp-summary"><div className="ring" style={{"--p":`${supplementProgress*3.6}deg`} as React.CSSProperties}><b>{supplementProgress}%</b></div><div><b>Heute erledigt</b><p>{supplements.filter(s=>s.taken).length} von {supplements.length} Einnahmen</p></div></div>
        {supplements.map(s=><div className="checkrow" key={s.id} onClick={()=>toggle(s.id)}><div className={"check "+(s.taken?"done":"")}>{s.taken&&<Check size={14}/>}</div><span>{s.name}</span><small>{s.amount} · {s.time}</small></div>)}
      </section>
    </div>
    <div className="grid twocol">
      <section className="card"><CardHead title="Nächste Termine" action="Kalender" onClick={()=>setPage("calendar")}/>
        <Event time="18:30" title="Ganzkörper A" meta="Training · 55 min"/>
        <Event time="20:00" title="Abendessen" meta="Kalender · privat"/>
      </section>
      <section className="card"><CardHead title="Letzte Aktivitäten" action="Alle" onClick={()=>setPage("activities")}/>
        {mockActivities.slice(0,2).map(a=><div className="activityrow" key={a.name}><div className="activityicon"><Route size={17}/></div><div><b>{a.name}</b><p>{a.type} · {a.date}</p></div><strong>{a.distance}</strong></div>)}
      </section>
    </div>
  </div>
}

function Metric({icon,label,value,sub}:{icon:React.ReactNode;label:string;value:string;sub:string}){return <div className="metric card"><div className="metricicon">{icon}</div><div><span>{label}</span><h2>{value}</h2><small>{sub}</small></div></div>}
function Progress({value}:{value:number}){return <div className="progress"><i style={{width:`${value}%`}}/></div>}
function CardHead({title,action,onClick}:{title:string;action?:string;onClick?:()=>void}){return <div className="cardhead"><h3>{title}</h3>{action&&<button className="textbtn" onClick={onClick}>{action}<ChevronRight size={15}/></button>}</div>}
function Event({time,title,meta}:{time:string;title:string;meta:string}){return <div className="event"><time>{time}</time><div><b>{title}</b><p>{meta}</p></div><ChevronRight size={17}/></div>}

function CalendarPage({setPage}:{setPage:(p:Page)=>void}){return <div><PageTitle title="Kalender" desc="Deine Termine und geplanten Einheiten auf einen Blick." action={<button className="primary" onClick={()=>setPage("training")}><Plus size={17}/> Training planen</button>}/><section className="card calendar"><div className="calhead"><button>‹</button><b>August 2026</b><button>›</button></div><div className="week">{["Mo","Di","Mi","Do","Fr","Sa","So"].map(x=><span key={x}>{x}</span>)}</div><div className="days">{Array.from({length:31},(_,i)=>i+1).map(d=><div className={d===27?"day today":"day"} key={d}><span>{d}</span>{[3,7,12,18,27].includes(d)&&<i/>}</div>)}</div></section><div className="card"><CardHead title="Donnerstag, 27. August"/><Event time="18:30" title="Ganzkörper A" meta="Training · 55 min · geplant"/><Event time="20:00" title="Abendessen" meta="Privater Kalender"/></div></div>}

function Training({workouts,setWorkouts,activeWorkout,setActiveWorkout}:{workouts:Workout[];setWorkouts:(x:Workout[])=>void;activeWorkout:string|null;setActiveWorkout:(x:string|null)=>void}){
  const [editing,setEditing]=useState<Workout|null>(null);
  if(editing) return <WorkoutEditor initial={editing} onCancel={()=>setEditing(null)} onSave={w=>{setWorkouts(workouts.some(x=>x.id===w.id)?workouts.map(x=>x.id===w.id?w:x):[...workouts,w]);setEditing(null)}}/>;
  if(activeWorkout){const w=workouts.find(x=>x.id===activeWorkout)!;return <LiveWorkout workout={w} onDone={()=>{setActiveWorkout(null);setWorkouts(workouts.map(x=>x.id===w.id?{...x,lastCompleted:new Date().toLocaleDateString("de-DE")}:x))}}/>}
  return <div><PageTitle title="Training" desc="Erstelle Einheiten, plane sie und tracke deinen Fortschritt." action={<button className="primary" onClick={()=>setEditing({id:crypto.randomUUID(),name:"Neue Einheit",description:"Kraft · 45 min",exercises:[]})}><CirclePlus size={17}/> Einheit erstellen</button>}/><div className="workoutgrid">{workouts.map(w=><section className="card workoutcard" key={w.id}><div className="workouttop"><div className="workoutbadge"><Dumbbell size={19}/></div><button className="iconbtn"><MoreHorizontal size={19}/></button></div><h3>{w.name}</h3><p>{w.description}</p><div className="exercisechips">{w.exercises.map(e=><span key={e.id}>{e.name} · {e.sets}×{e.reps}</span>)}</div><div className="workoutfoot"><small>{w.exercises.length} Übungen {w.lastCompleted&&`· zuletzt ${w.lastCompleted}`}</small><div><button className="secondary" onClick={()=>setEditing(w)}>Bearbeiten</button><button className="primary small" onClick={()=>setActiveWorkout(w.id)}><Play size={14}/> Start</button></div></div></section>)}</div></div>
}

function WorkoutEditor({initial,onCancel,onSave}:{initial:Workout;onCancel:()=>void;onSave:(w:Workout)=>void}){
  const [w,setW]=useState(initial);
  const add=()=>setW({...w,exercises:[...w.exercises,{id:crypto.randomUUID(),name:"Neue Übung",sets:3,reps:10,weight:0}]});
  return <div><PageTitle title="Training erstellen" desc="Baue deine eigene Einheit aus Übungen und Sätzen." action={<><button className="secondary" onClick={onCancel}>Abbrechen</button><button className="primary" onClick={()=>onSave(w)}><Check size={17}/> Speichern</button></>}/><section className="card editor"><label>Trainingsname<input value={w.name} onChange={e=>setW({...w,name:e.target.value})}/></label><label>Beschreibung<input value={w.description} onChange={e=>setW({...w,description:e.target.value})}/></label><div className="editorhead"><h3>Übungen</h3><button className="secondary" onClick={add}><Plus size={16}/> Übung hinzufügen</button></div>{w.exercises.map((e,i)=><div className="exerciseedit" key={e.id}><input value={e.name} onChange={ev=>setW({...w,exercises:w.exercises.map(x=>x.id===e.id?{...x,name:ev.target.value}:x)})}/><label>Sätze<input type="number" value={e.sets} onChange={ev=>setW({...w,exercises:w.exercises.map(x=>x.id===e.id?{...x,sets:+ev.target.value}:x)})}/></label><label>Wdh.<input type="number" value={e.reps} onChange={ev=>setW({...w,exercises:w.exercises.map(x=>x.id===e.id?{...x,reps:+ev.target.value}:x)})}/></label><label>kg<input type="number" value={e.weight} onChange={ev=>setW({...w,exercises:w.exercises.map(x=>x.id===e.id?{...x,weight:+ev.target.value}:x)})}/></label><button className="iconbtn danger" onClick={()=>setW({...w,exercises:w.exercises.filter(x=>x.id!==e.id)})}><X size={17}/></button></div>)}</section></div>
}

function LiveWorkout({workout,onDone}:{workout:Workout;onDone:()=>void}){const [done,setDone]=useState<Record<string,boolean>>({});const count=Object.values(done).filter(Boolean).length;return <div><PageTitle title={workout.name} desc="Aktives Training"/><section className="card liveworkout"><div className="livehead"><div><span>FORTSCHRITT</span><h2>{count} / {workout.exercises.length} Übungen</h2></div><div className="bigplay"><Play size={22}/></div></div>{workout.exercises.map(e=><div className="liveexercise" key={e.id}><div><b>{e.name}</b><p>{e.sets} Sätze × {e.reps} · {e.weight} kg</p></div><button className={"check big "+(done[e.id]?"done":"")} onClick={()=>setDone({...done,[e.id]:!done[e.id]})}>{done[e.id]?<Check/>:<span/>}</button></div>)}<button className="primary wide" onClick={onDone}>Training beenden</button></section></div>}

function Activities(){return <div><PageTitle title="Aktivitäten" desc="Deine importierten Komoot-Touren und sonstigen Aktivitäten."/><div className="grid statsgrid"><Metric icon={<Route/>} label="Monatliche Distanz" value="143,8 km" sub="+21 % vs. Vormonat"/><Metric icon={<TrendingUp/>} label="Höhenmeter" value="2.184 m" sub="12 Touren"/><Metric icon={<Activity/>} label="Aktivitätszeit" value="14 h 28 min" sub="diesen Monat"/><Metric icon={<Target/>} label="Touren" value="18" sub="dieses Jahr"/></div><section className="card"><CardHead title="Komoot-Aktivitäten"/>{mockActivities.map(a=><div className="tableRow" key={a.name}><div className="activityicon"><Route size={17}/></div><div><b>{a.name}</b><small>{a.type} · {a.date}</small></div><span>{a.distance}</span><span>{a.duration}</span><span>{a.elevation}</span><ChevronRight size={16}/></div>)}</section></div>}

function Nutrition(){return <div><PageTitle title="Ernährung" desc="YAZIO-Daten zentral in deinem Tagesdashboard."/><div className="grid statsgrid"><Metric icon={<Utensils/>} label="Kalorien" value="1.842 kcal" sub="80 % vom Ziel"/><Metric icon={<Target/>} label="Protein" value="128 g" sub="32 g fehlen"/><Metric icon={<Activity/>} label="Kohlenhydrate" value="186 g" sub="Ziel: 250 g"/><Metric icon={<Apple/>} label="Fett" value="61 g" sub="Ziel: 75 g"/></div><div className="grid twocol"><section className="card"><CardHead title="Makros"/><Macro label="Protein" value="128 g" pct={80}/><Macro label="Kohlenhydrate" value="186 g" pct={74}/><Macro label="Fett" value="61 g" pct={81}/></section><section className="card"><CardHead title="Heutige Mahlzeiten"/><Event time="08:15" title="Frühstück" meta="512 kcal · 31 g Protein"/><Event time="13:10" title="Mittagessen" meta="684 kcal · 49 g Protein"/><Event time="19:30" title="Abendessen" meta="646 kcal · 48 g Protein"/></section></div></div>}
function Macro({label,value,pct}:{label:string;value:string;pct:number}){return <div className="macro"><div><b>{label}</b><span>{value}</span></div><Progress value={pct}/></div>}

function Health(){
  const [data,setData]=useState<any>(null);
  const [status,setStatus]=useState("Noch keine Synchronisierung");
  useEffect(()=>{
    fetch(`/api/health/today?date=${dateKey}`).then(r=>r.json()).then(x=>{setData(x.data); if(x.data)setStatus("Mit FitLife synchronisiert")}).catch(()=>{});
  },[]);
  const steps=data?.steps != null ? Number(data.steps).toLocaleString("de-DE") : "—";
  const calories=data?.active_calories != null ? `${Math.round(Number(data.active_calories))} kcal` : "—";
  const sleep=data?.sleep_minutes != null ? `${Math.floor(Number(data.sleep_minutes)/60)}:${String(Number(data.sleep_minutes)%60).padStart(2,"0")} h` : "—";
  const weight=data?.weight_kg != null ? `${Number(data.weight_kg).toLocaleString("de-DE")} kg` : "—";
  const heart=data?.heart_rate_avg != null ? `${Math.round(Number(data.heart_rate_avg))} bpm` : "—";
  return <div><PageTitle title="Gesundheit" desc="Apple-Health-Werte aus deiner FitLife-Synchronisierung."/><div className="integrationNotice"><Watch size={20}/><div><b>Apple Health Connector</b><p>{status}. Der iPhone-Kurzbefehl sendet die Werte später an diese FitLife-API.</p></div><span className="pill">{data?"Verbunden":"Bereit"}</span></div><div className="grid statsgrid"><Metric icon={<Footprints/>} label="Schritte" value={steps} sub="heute"/><Metric icon={<Activity/>} label="Aktive Kalorien" value={calories} sub="heute"/><Metric icon={<Moon/>} label="Schlaf" value={sleep} sub="letzte Nacht"/><Metric icon={<HeartPulse/>} label="Ø Puls" value={heart} sub="heute"/><Metric icon={<Activity/>} label="Gewicht" value={weight} sub="letzter Wert"/></div><section className="card chartcard"><CardHead title="Apple Health"/><p className="muted">Sobald der iPhone-Kurzbefehl Daten synchronisiert, werden sie hier angezeigt.</p></section></div>}

function Supplements({supplements,setSupplements}:{supplements:Supplement[];setSupplements:(x:Supplement[])=>void}){const toggle=(id:string)=>setSupplements(supplements.map(s=>s.id===id?{...s,taken:!s.taken}:s));return <div><PageTitle title="Supplements" desc="Deine tägliche Einnahme-Checkliste." action={<button className="primary" onClick={()=>setSupplements([...supplements,{id:crypto.randomUUID(),name:"Neues Supplement",amount:"1 Portion",taken:false,time:"12:00"}])}><Plus size={17}/> Hinzufügen</button>}/><div className="suppgrid">{supplements.map(s=><section className={"card suppcard "+(s.taken?"completed":"")} key={s.id}><div className="supptop"><div className="suppicon"><Apple size={20}/></div><button className={"check big "+(s.taken?"done":"")} onClick={()=>toggle(s.id)}>{s.taken?<Check/>:<span/>}</button></div><h3>{s.name}</h3><p>{s.amount} · Einnahme um {s.time}</p><div className="suppstatus">{s.taken?"Heute erledigt":"Noch offen"}</div></section>)}</div><section className="card"><CardHead title="Hinweis"/><p className="muted">Dieser Tracker dokumentiert nur deine eigene Routine. Dosierung und Einnahme solltest du nach deiner persönlichen Planung bzw. fachlicher Empfehlung festlegen.</p></section></div>}

function Stats(){return <div><PageTitle title="Statistiken" desc="Ein Überblick über deine Entwicklung."/><div className="grid statsgrid"><Metric icon={<TrendingUp/>} label="Trainings" value="18" sub="diesen Monat"/><Metric icon={<Dumbbell/>} label="Trainingsvolumen" value="24,6 t" sub="+12 %"/><Metric icon={<Route/>} label="Distanz" value="143,8 km" sub="+21 %"/><Metric icon={<Target/>} label="Zielerreichung" value="82 %" sub="alle Bereiche"/></div><section className="card chartcard"><CardHead title="Trainingsvolumen · 8 Wochen"/><div className="bars tall">{[38,46,41,63,57,71,68,84].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>W{i+1}</span></div>)}</div></section></div>}

function SettingsPage(){return <div><PageTitle title="Einstellungen" desc="Datenquellen und App-Konfiguration."/><section className="card"><CardHead title="Integrationen"/><Integration icon={<Apple/>} name="Apple Health" detail="HealthKit über iOS-Companion-App" status="Bereit für Connector"/><Integration icon={<CalendarDays/>} name="Apple Kalender" detail="Kalendertermine und Trainingsplanung" status="Bereit für Connector"/><Integration icon={<Route/>} name="Komoot" detail="Touren, Distanz und Höhenmeter" status="API-Adapter vorbereitet"/><Integration icon={<Utensils/>} name="YAZIO" detail="Kalorien und Makros" status="API-Adapter vorbereitet"/></section><section className="card"><CardHead title="Datenschutz"/><p className="muted">Im aktuellen Prototyp werden Trainings- und Supplementdaten ausschließlich lokal im Browser gespeichert (localStorage). Externe Konten werden noch nicht verbunden.</p></section></div>}
function Integration({icon,name,detail,status}:{icon:React.ReactNode;name:string;detail:string;status:string}){return <div className="integration"><div className="metricicon">{icon}</div><div><b>{name}</b><p>{detail}</p></div><span className="pill">{status}</span><button className="secondary">Verbinden</button></div>}
function PageTitle({title,desc,action}:{title:string;desc:string;action?:React.ReactNode}){return <div className="pagetitle"><div><h1>{title}</h1><p>{desc}</p></div><div className="actions">{action}</div></div>}

export default App;
