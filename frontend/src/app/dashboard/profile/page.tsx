"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage(){

  const router = useRouter();

 const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [avatar,setAvatar] = useState("");
const [loading,setLoading] = useState(false);
const [uploading,setUploading] = useState(false);
const [message,setMessage] = useState("");
const [createdAt,setCreatedAt] = useState("");
  async function loadProfile(){

    const {
      data:{user}
    } = await supabase.auth.getUser();


    if(!user){

      router.push("/auth/login");
      return;

    }


    setEmail(user.email || "");


    const { data, error } = await supabase
  .from("profiles")
  .select("full_name, avatar_url, created_at")
  .eq("id", user.id)
  .maybeSingle();

if (error) {
  console.error(error);
  return;
}

if (data) {

  setName(data.full_name || "");

  setAvatar(
    data.avatar_url 
      ? data.avatar_url + "?t=" + Date.now()
      : ""
  );


  if(data.created_at){

    setCreatedAt(
      new Date(data.created_at)
        .toLocaleDateString()
    );

  }

}
  
  }

  useEffect(()=>{
    loadProfile();
  },[]);


async function uploadAvatar(
  e: React.ChangeEvent<HTMLInputElement>
) {
  try {
    const file = e.target.files?.[0];

    if (!file) return;
if(file.size > 2 * 1024 * 1024){

  setMessage(
    "Image must be smaller than 2MB."
  );

  return;

}
    setUploading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();


    if (!user) return;


    const extension = file.name.split(".").pop();

const filePath = `${user.id}/avatar.${extension}`;


    const {
      error: uploadError
    } = await supabase.storage
      .from("avatars")
      .upload(
        filePath,
        file,
        {
          upsert: true,
          contentType: file.type
        }
      );


    if(uploadError){

      console.error(uploadError);
      setMessage(uploadError.message);
      return;

    }


    const {
      data
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);



    const publicUrl = data.publicUrl;



    const {
      error: profileError
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl
      })
      .eq(
        "id",
        user.id
      );



    if(profileError){

      console.error(profileError);
      setMessage(profileError.message);
      return;

    }



    setAvatar(
      publicUrl + "?t=" + Date.now()
    );


    setMessage(
      "Profile picture updated successfully."
    );


  }
  catch(error){

    console.error(error);
    setMessage("Upload failed.");

  }
  finally{

    setUploading(false);

  }

}

async function saveProfile(){

    setLoading(true);
    setMessage("");


    const {
      data:{user}
    } = await supabase.auth.getUser();



    if (!user) {
  setLoading(false);
  return;
}



    const {error}=await supabase
      .from("profiles")
      .update({

        full_name:name

      })
      .eq(
        "id",
        user.id
      );



    if(error){

      setMessage(
        "Failed to update profile"
      );

    }
    else{

      setMessage(
        "Profile updated successfully"
      );

    }


    setLoading(false);

  }




return (

<main className="min-h-screen bg-[#0B1020] p-8 text-white">


<div className="mx-auto max-w-xl">

<button

onClick={()=>router.push("/dashboard")}

className="mb-12 text-gray-400"

>
← Back to Dashboard
</button>

<h1 className="text-3xl font-bold">
Profile Settings
</h1>



<div className="mt-8 rounded-2xl bg-white/5 p-6">
<div className="mb-6 flex flex-col items-center">


<img

src={
  avatar ||
  "https://placehold.co/120x120"
}

className="h-28 w-28 rounded-full object-cover"

/>


<label className="mt-4 cursor-pointer rounded-xl bg-white px-5 py-2 text-black">

{
uploading
?
"Uploading..."
:
"Change Photo"
}


<input

type="file"

accept="image/*"

onChange={uploadAvatar}

className="hidden"

/>


</label>


</div>


<label className="text-gray-400">
Email
</label>


<input

value={email}

disabled

className="mt-2 w-full rounded-xl bg-gray-900 p-3"

/>



<label className="mt-5 block text-gray-400">
Member Since
</label>

<input

value={createdAt}

disabled

className="mt-2 w-full rounded-xl bg-gray-900 p-3"

/>




<button

onClick={saveProfile}

disabled={loading}

className="mt-6 rounded-xl bg-white px-6 py-3 text-black font-semibold"

>

{
loading
?
"Saving..."
:
"Save Changes"
}

</button>



{
message &&

<p className="mt-4 text-green-400">
{message}
</p>

}



</div>


<button

onClick={async()=>{

  await supabase.auth.signOut();

  router.push("/auth/login");

}}

className="mt-6 w-full rounded-xl bg-red-600 px-6 py-3 font-semibold"

>
Logout
</button>



</div>


</main>

);


}