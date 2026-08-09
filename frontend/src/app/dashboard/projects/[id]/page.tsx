"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";


export default function ProjectPage(){

  const router = useRouter();

  const params = useParams();

  const projectId = params.id as string;


  const [project,setProject] = useState<any>(null);
  const [history,setHistory] = useState<any[]>([]);
const [search,setSearch] = useState("");
const [editName,setEditName] = useState("");
const [editing,setEditing] = useState(false);

  async function loadProject(){

    const {
      data:{user}
    } = await supabase.auth.getUser();


    if(!user){

      router.push("/auth/login");
      return;

    }



    const {
      data:projectData,
      error:projectError
    } = await supabase
      .from("projects")
      .select("*")
      .eq("id",projectId)
      .single();



    if(projectError){

      console.error(projectError);
      return;

    }



    setProject(projectData);



    const {
      data:historyData,
      error:historyError
    } = await supabase
      .from("history")
      .select("*")
      .eq(
        "project_id",
        projectId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );



    if(historyError){

      console.error(historyError);
      return;

    }


    setHistory(
      historyData || []
    );

  }

  useEffect(()=>{

    loadProject();

  },[]);

async function renameProject(){

  if(!editName.trim()) return;


  const {error}=await supabase
    .from("projects")
    .update({
      name:editName
    })
    .eq(
      "id",
      projectId
    );


  if(error){

    console.error(error);
    return;

  }


  setProject({
    ...project,
    name:editName
  });


  setEditing(false);

}

async function deleteProject(){

  const confirmDelete =
    confirm(
      "Delete this project and all copies?"
    );


  if(!confirmDelete) return;



  const {error}=await supabase
    .from("projects")
    .delete()
    .eq(
      "id",
      projectId
    );


  if(error){

    console.error(error);
    return;

  }


  router.push("/dashboard");

}

function copyText(value:string){

  navigator.clipboard.writeText(value);

}



async function toggleFavorite(
  id:string,
  current:boolean
){

  const {error}=await supabase
    .from("history")
    .update({
      favorite:!current
    })
    .eq(
      "id",
      id
    );


  if(error){

    console.error(error);
    return;

  }


  loadProject();

}




async function deleteCopy(
  id:string
){

  const confirmDelete =
    confirm(
      "Delete this copy?"
    );


  if(!confirmDelete) return;



  const {error}=await supabase
    .from("history")
    .delete()
    .eq(
      "id",
      id
    );



  if(error){

    console.error(error);
    return;

  }


  loadProject();

}


return (

<main className="min-h-screen bg-[#0B1020] p-8 text-white">


<div className="mx-auto max-w-5xl">


<button

onClick={()=>router.push("/dashboard")}

className="text-gray-400"

>
← Back to Dashboard
</button>


{
project && (

<div>

<div className="flex items-center justify-between">

<h1 className="text-4xl font-bold">
📁 {project.name}
</h1>

<div className="flex gap-3">

<button

onClick={()=>{
setEditName(project.name);
setEditing(true);
}}

className="rounded-lg bg-white px-4 py-2 text-black"

>

Rename

</button>

<button

onClick={deleteProject}

className="rounded-lg bg-red-600 px-4 py-2"

>

Delete Project

</button>

</div>

</div>

</div>

)}


<p className="mt-2 text-gray-400">

{history.length} copies created

</p>


{
editing &&

<div className="mt-5 flex gap-3">

<input

value={editName}

onChange={(e)=>
setEditName(e.target.value)
}

className="flex-1 rounded-xl bg-gray-900 p-3"

/>


<button

onClick={renameProject}

className="rounded-xl bg-green-500 px-5 py-2 text-black"

>

Save

</button>

</div>

}

<input

placeholder="Search copies..."

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

className="mt-5 w-full rounded-xl bg-gray-900 p-3"

 />


<div className="mt-8 space-y-5">


{
history
.filter((item)=>
  item.improved_text
  ?.toLowerCase()
  .includes(
    search.toLowerCase()
  )
)
.map((item)=>(


<div

key={item.id}

className="rounded-2xl bg-white/5 p-5"

>


<div className="flex justify-between">


<div>

<h2 className="font-bold">
{item.copy_type}
</h2>

<p className="text-gray-400">
{item.tone}
</p>

</div>


</div>



<p className="mt-4 text-gray-300 whitespace-pre-wrap">

{item.improved_text}

</p>



<div className="mt-5 flex gap-3">


<button

onClick={()=>
copyText(item.improved_text)
}

className="rounded-lg bg-white px-4 py-2 text-black"

>

Copy

</button>




<button

onClick={()=>
toggleFavorite(
item.id,
item.favorite
)
}

className="rounded-lg bg-yellow-400 px-4 py-2 text-black"

>

{
item.favorite
?
"★"
:
"☆"
}

</button>




<button

onClick={()=>
deleteCopy(item.id)
}

className="rounded-lg bg-red-600 px-4 py-2"

>

Delete

</button>


</div>



</div>


))

}


</div>


</div>


</main>

);


}