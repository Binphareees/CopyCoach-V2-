"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface CopyResult {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  framework?: string;
  improvedCopy?: string;
  coachAdvice?: string;
}

interface HistoryItem {
  id: string;
  project_id?: string;
  original_text: string;
  improved_text: string;
  copy_type: string;
  tone: string;
  favorite: boolean;
  created_at?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  created_at?: string;
}

export default function DashboardPage() {

  const router = useRouter();

const [, setUserEmail] = useState("");
const [, setUserId] = useState("");
const [fullName, setFullName] = useState("");
const [showMenu, setShowMenu] = useState(false);
const [avatar, setAvatar] = useState("");

const [text, setText] = useState("");
const [result, setResult] = useState<CopyResult | string | null>(null);

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [copyType, setCopyType] = useState("Advertisement");
const [tone, setTone] = useState("Professional");

const [history, setHistory] = useState<HistoryItem[]>([]);

const [search, setSearch] = useState("");
const [showFavorites, setShowFavorites] = useState(false);

const [projects, setProjects] = useState<ProjectItem[]>([]);
const [selectedProject, setSelectedProject] = useState("");

const [showProjectForm, setShowProjectForm] = useState(false);
const [projectName, setProjectName] = useState("");

const [credits, setCredits] = useState(5);
const [plan, setPlan] = useState("free");
const [, setTodayUsed] = useState(0);
const [, setTotalCopies] = useState(0);
const [, setFavoriteCount] = useState(0);

async function loadUsage(){

  const {
    data:{user}
  } = await supabase.auth.getUser();


  if(!user) return;


  const {data,error}=await supabase
    .from("user_usage")
.select(`
  daily_generations_used,
  monthly_generations_used,
  plan,
  subscription_status,
  last_payment_date
`)
.eq("user_id", user.id)
.maybeSingle();

  if(error){

    console.error("Usage error:", error);
    return;

  }


  if (data) {
    if (data.plan === "pro") {
      setCredits(Math.max(0, 100 - (data.monthly_generations_used || 0)));
    } else {
      setCredits(Math.max(0, 5 - (data.daily_generations_used || 0)));
    }
    setPlan(data.plan || "free");
  } else {
    await supabase.from("user_usage").upsert({
      user_id: user.id,
      plan: "free",
      daily_generations_used: 0,
      monthly_generations_used: 0,
      daily_reset_date: new Date().toISOString(),
      monthly_reset_date: new Date().toISOString(),
      subscription_status: "active"
    }, { onConflict: "user_id" });

    setCredits(5);
    setPlan("free");
  }

}

async function loadAnalytics(){

  const {
    data:{user}
  } = await supabase.auth.getUser();

  if(!user) return;

  const {data:usage} = await supabase
    .from("user_usage")
.select("daily_generations_used, monthly_generations_used, plan")
.eq("user_id", user.id)
.maybeSingle();

  if(usage){

  if(usage.plan === "pro"){

    setTodayUsed(
      usage.monthly_generations_used
    );

  } else {

    setTodayUsed(
      usage.daily_generations_used
    );

  }

}

  const {count:historyCount} = await supabase
    .from("history")
    .select("*", {
      count:"exact",
      head:true
    })
    .eq("user_id", user.id);

  setTotalCopies(
    historyCount || 0
  );

  const {count:favorites} = await supabase
    .from("history")
    .select("*", {
      count:"exact",
      head:true
    })
    .eq("user_id", user.id)
    .eq("favorite", true);

  setFavoriteCount(
    favorites || 0
  );

}

useEffect(() => {
  let isMounted = true;
  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (isMounted) {
      setUserId(user.id);
      await loadProfile(user.id, user);
      await loadUsage();
      await loadAnalytics();
      await loadProjects();
      loadHistory();
    }
  }
  init();
  return () => { isMounted = false; };
}, [router]);

async function loadProfile(
  id: string,
  user: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string; picture?: string } }
) {

  const {data,error}=await supabase
    .from("profiles")
    .select("full_name, avatar_url, email")
    .eq("id",id)
    .maybeSingle();


  if(error){

    console.error("Profile error:", error);
    return;

  }


  if(data){

    setFullName(
      data.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "User"
    );


    setAvatar(
      data.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      ""
    );


    return;

  }


  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "User";


  setFullName(name);


  setAvatar(
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    ""
  );

}


async function improveCopy(){
  console.log("🔥 IMPROVE COPY STARTED");
  const { data: { user } } = await supabase.auth.getUser();

  if(!user) return;
  if(!text.trim()) return;

  setLoading(true);

  try {
    const response = await fetch("/api/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id
      },
      body: JSON.stringify({
        text,
        copyType,
        tone
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const improvedResult = data.result || data.error || "No response received";
    setResult(improvedResult);

    await loadUsage();
    await loadAnalytics();

    const historyData = {
      user_id: user.id,
      project_id: selectedProject || null,
      original_text: text,
      improved_text:
        typeof improvedResult === "object"
          ? improvedResult.improvedCopy
          : improvedResult,
      copy_type: copyType,
      tone: tone,
      favorite: false
    };

    const { error } = await supabase.from("history").insert(historyData);
    if (!error) {
      loadHistory();
    }
  } catch(error) {
    console.error("IMPROVE COPY ERROR:", error);
    setResult(String(error));
  } finally {
    setLoading(false);
  }
}





 async function loadHistory(){

  const {
    data,
    error
  } = await supabase
    .from("history")
    .select("*")
    .order(
      "created_at",
      {
        ascending:false
      }
    );


  if(error){

    console.error(
      "History error:",
      error
    );

    return;

  }


  setHistory(
    data || []
  );

}


  async function toggleFavorite(
    id:string,
    current:boolean
  ){


    const {
      error
    } = await supabase
      .from("history")
      .update({

        favorite:!current

      })
      .eq(
        "id",
        id
      );



    if(error){

      console.error(
        error
      );

      return;

    }



    loadHistory();

  }



async function loadProjects(){

  const {
    data:{user}
  } = await supabase.auth.getUser();

  if(!user) return;

  const {data,error} = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  if(error){

    console.error(
      "Projects error:",
      error
    );

    return;

  }

  setProjects(
    data || []
  );

}

async function createProject(){

  if(!projectName.trim()) return;


  const {
    data:{user}
  } = await supabase.auth.getUser();


  if(!user) return;


  const {data,error}=await supabase
    .from("projects")
    .insert({

      user_id:user.id,

      name:projectName

    })
    .select()
    .single();



  if(error){

    console.error(
      "Create project error:",
      error
    );

    return;

  }


  setProjects([
    ...projects,
    data
  ]);


  setSelectedProject(
    data.id
  );


  setProjectName("");

  setShowProjectForm(false);

}

  async function deleteHistory(
    id:string
  ){


    const {
      error
    } = await supabase
      .from("history")
      .delete()
      .eq(
        "id",
        id
      );



    if(error){

      console.error(
        error
      );

      return;

    }



    loadHistory();

  }







  function copyText(value:string){

    navigator.clipboard.writeText(value);

  }




async function upgradeToPro(){

  const {
    data:{user}
  } = await supabase.auth.getUser();


  if(!user){

    router.push("/auth/login");
    return;

  }


  const response = await fetch(
    "/api/paystack/initialize",
    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        email: user.email,
        userId: user.id
      })

    }
  );


  const data = await response.json();

if(!response.ok){

  setMessage(
    data.error || "Generation limit reached"
  );

  setLoading(false);

  return;

}

  if(data.data?.authorization_url){

    window.location.href =
      data.data.authorization_url;

  }
  else{

    console.error(
      "Payment error:",
      data
    );

  }

}


 async function logout(){

  await supabase.auth.signOut();

  router.push("/auth/login");

}






  const filteredHistory =
    history.filter((item)=>{


      const matchesSearch =
        item.improved_text
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );



      const matchesFavorite =
        showFavorites
        ? item.favorite
        : true;



      return (
        matchesSearch &&
        matchesFavorite
      );


    });





return (

<main className="min-h-screen bg-[#0B1020] p-8 text-white">


<div className="mx-auto max-w-5xl">



<div className="flex items-center justify-between">

<div className="flex items-center gap-3">
<img src="/logo-symbol.svg" alt="CopyCoach AI" className="h-12 w-12 object-contain" />
<div>

<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-[#00F0FF] bg-clip-text text-transparent">
CopyCoach AI
</h1>

<p className="text-gray-400 mt-1">
Welcome back, {fullName || "User"} 👋
</p>

</div>
</div>


<div className="relative">


<button
onClick={()=>setShowMenu(!showMenu)}
className="flex items-center gap-3"
>


<img

src={
avatar ||
"https://placehold.co/80x80"
}

className="h-12 w-12 rounded-full object-cover border"

alt="Avatar"

/>


<div className="text-left">

<p className="font-semibold">
{fullName || "User"}
</p>

<p className="text-xs text-gray-400">
Account
</p>

</div>


</button>



{
showMenu &&

<div className="absolute right-0 mt-3 w-48 rounded-xl bg-gray-900 p-3 shadow-xl">


<button

onClick={()=>router.push("/dashboard/profile")}

className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10"

>

Profile Settings

</button>



<button

onClick={logout}

className="mt-2 w-full rounded-lg px-3 py-2 text-left text-red-400 hover:bg-white/10"

>

Logout

</button>


</div>

}


</div>

</div>



<div className="mb-6 rounded-2xl bg-white/5 p-6">

  <h2 className="text-xl font-semibold">
    AI Credits
  </h2>


  <p className="mt-2 text-gray-400">
  {plan === "free" ? "Free Plan" : "⭐ Premium Plan"}
</p>


  <div className="mt-4 flex items-end gap-2">

    <span className="text-4xl font-bold">
      {credits}
    </span>

   <span className="mb-1 text-gray-400">
  / {plan === "pro" ? 100 : 5} today
</span>

  </div>


  <p className="mt-2 text-sm text-gray-400">
    AI copy improvements remaining
  </p>


  {
    plan === "free" &&

    <button

onClick={upgradeToPro}

className="mt-5 rounded-xl bg-white px-5 py-2 text-black font-semibold"

>
  Upgrade to Pro
</button>

  }


</div>


<div className="mb-6 rounded-2xl bg-white/5 p-6">

<div className="flex justify-between items-center">

<h2 className="text-xl font-semibold">
Projects
</h2>


<button

onClick={()=>setShowProjectForm(!showProjectForm)}

className="rounded-xl bg-white px-4 py-2 text-black"

>
+ New Project
</button>

</div>



{
showProjectForm &&

<div className="mt-4 flex gap-3">

<input

value={projectName}

onChange={(e)=>setProjectName(e.target.value)}

placeholder="Project name"

className="flex-1 rounded-xl bg-gray-900 p-3"

/>


<button

onClick={createProject}

className="rounded-xl bg-[#5B5CEB] px-5"

>
Create
</button>

</div>

}

<div className="mt-5 space-y-3">


{
projects.map((project)=>(

<div

key={project.id}

onClick={()=>
router.push(
`/dashboard/projects/${project.id}`
)
}

className="cursor-pointer rounded-xl bg-gray-900 p-4 hover:bg-white/10"

>


<div className="flex items-center justify-between">


<div>

<h3 className="font-semibold">
📁 {project.name}
</h3>


<p className="text-sm text-gray-400">
Open project workspace
</p>


</div>


<span className="text-gray-400">
→
</span>


</div>


</div>


))

}


</div>

<select

value={selectedProject}

onChange={(e)=>setSelectedProject(e.target.value)}

className="mt-5 w-full rounded-xl bg-gray-900 p-3"

>

<option value="">
Select Project
</option>


{
projects.map((project)=>(

<option
key={project.id}
value={project.id}
>
{project.name}
</option>

))
}


</select>


</div>

<div className="mt-10 rounded-2xl bg-white/5 p-6">



<div className="grid grid-cols-2 gap-4">


<select

value={copyType}

onChange={(e)=>setCopyType(e.target.value)}

className="rounded-xl bg-gray-900 p-3"

>

<option>Advertisement</option>
<option>Email</option>
<option>Landing Page</option>
<option>Social Media</option>
<option>Blog</option>

</select>





<select

value={tone}

onChange={(e)=>setTone(e.target.value)}

className="rounded-xl bg-gray-900 p-3"

>

<option>Professional</option>
<option>Friendly</option>
<option>Luxury</option>
<option>Funny</option>
<option>Persuasive</option>
<option>Urgent</option>


</select>


</div>






<textarea

className="mt-5 h-48 w-full rounded-xl bg-gray-900 p-4"

placeholder="Paste your copy here..."

value={text}

onChange={(e)=>setText(e.target.value)}

 />


{message && (
  <p className="mt-4 text-red-500">
    {message}
  </p>
)}


<button
  onClick={() => {
    console.log("BUTTON CLICKED");
    improveCopy();
  }}
  disabled={loading}
  className="mt-5 rounded-xl bg-[#5B5CEB] px-6 py-3 font-semibold text-white"
>
  {loading ? "Improving..." : "Improve Copy"}
</button>




{result &&

<div className="mt-8 space-y-5">


<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-2xl font-bold">
Copy Score
</h2>

<p className="mt-3 text-5xl font-bold text-[#7CFFB2]">
{result.score || 0}/100
</p>

</div>



<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-xl font-bold">
Strengths
</h2>

<ul className="mt-3 list-disc pl-5 text-gray-300">

{result.strengths?.map(
(item:string,index:number)=>(
<li key={index}>
{item}
</li>
)
)}

</ul>

</div>




<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-xl font-bold">
Weaknesses
</h2>

<ul className="mt-3 list-disc pl-5 text-gray-300">

{result.weaknesses?.map(
(item:string,index:number)=>(
<li key={index}>
{item}
</li>
)
)}

</ul>

</div>




<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-xl font-bold">
Framework Detected
</h2>

<p className="mt-3 text-gray-300">
{result.framework}
</p>

</div>




<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-xl font-bold">
Improved Copy
</h2>


<p className="mt-3 whitespace-pre-wrap text-gray-200">
{typeof result === "object"
  ? result.improvedCopy
  : result}
</p>


</div>




<div className="rounded-xl bg-white/10 p-5">

<h2 className="text-xl font-bold">
Coach Advice
</h2>


<p className="mt-3 text-gray-300">
{result.coachAdvice}
</p>


</div>



</div>

}



</div>







<div className="mt-10">


<h2 className="text-2xl font-bold">
Copy History
</h2>



<div className="flex gap-3 mt-5">


<input

placeholder="Search copies..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="flex-1 rounded-xl bg-gray-900 p-3"

/>



<button

onClick={()=>setShowFavorites(!showFavorites)}

className="bg-yellow-400 text-black px-5 rounded-xl"

>

{showFavorites ? "★ Favorites":"☆ All"}

</button>


</div>





<div className="space-y-5 mt-5">


{filteredHistory.map((item)=>(


<div

key={item.id}

className="rounded-2xl bg-white/5 p-5"

>


<div className="flex justify-between">


<div>

<p className="font-bold">
{item.copy_type}
</p>

<p className="text-gray-400">
{item.tone}
</p>

</div>




<div className="flex gap-2">


<button

onClick={()=>toggleFavorite(item.id,item.favorite)}

className="bg-yellow-400 text-black px-3 rounded"

>

{item.favorite ? "★":"☆"}

</button>



<button

onClick={()=>copyText(item.improved_text)}

className="bg-white text-black px-3 rounded"

>

Copy

</button>



<button

onClick={()=>deleteHistory(item.id)}

className="bg-red-600 px-3 rounded"

>

Delete

</button>


</div>


</div>



<p className="mt-4 text-gray-300">
{item.improved_text}
</p>


</div>


))}


</div>


</div>



</div>


</main>

);


}