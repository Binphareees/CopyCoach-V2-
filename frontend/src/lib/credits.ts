import { supabaseAdmin } from "@/lib/supabase-admin";


const FREE_DAILY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 100;



export async function canGenerate(userId: string) {

  const { data: usage, error } = await supabaseAdmin
    .from("user_usage")
    .select(`
      plan,
      daily_generations_used,
      daily_reset_date,
      monthly_generations_used,
      monthly_reset_date
    `)
    .eq("user_id", userId)
    .single();


  if(error || !usage){

    return {
      allowed: false,
      reason: "Usage record not found"
    };

  }



  const now = new Date();



  // PREMIUM USER
  if(usage.plan === "pro"){


    const resetDate = new Date(
      usage.monthly_reset_date
    );


    if(
      resetDate.getMonth() !== now.getMonth() ||
      resetDate.getFullYear() !== now.getFullYear()
    ){

      await supabaseAdmin
        .from("user_usage")
        .update({
          monthly_generations_used: 0,
          monthly_reset_date: now.toISOString()
        })
        .eq(
          "user_id",
          userId
        );


      usage.monthly_generations_used = 0;

    }



    if(
      usage.monthly_generations_used >= PREMIUM_MONTHLY_LIMIT
    ){

      return {
        allowed:false,
        reason:
"You've reached your monthly Pro limit of 100 generations."
      };

    }



    return {
      allowed:true,
      type:"monthly"
    };


  }



  // FREE USER

  const resetDate = new Date(
    usage.daily_reset_date
  );


  if(
    resetDate.toDateString() !== now.toDateString()
  ){

    await supabaseAdmin
      .from("user_usage")
      .update({
        daily_generations_used:0,
        daily_reset_date:now.toISOString()
      })
      .eq(
        "user_id",
        userId
      );


    usage.daily_generations_used = 0;

  }



  if(
    usage.daily_generations_used >= FREE_DAILY_LIMIT
  ){

    return {
      allowed:false,
      reason:
"You've used all 5 free generations for today. Upgrade to Pro or come back tomorrow."
    };

  }



  return {
    allowed:true,
    type:"daily"
  };


}

export async function useCredit(userId: string) {

  const { data: usage, error } = await supabaseAdmin
    .from("user_usage")
    .select(`
      plan,
      daily_generations_used,
      monthly_generations_used
    `)
    .eq("user_id", userId)
    .single();


  if(error || !usage){

    return {
      success:false,
      reason:"Usage record not found"
    };

  }



    console.log("PRO USAGE BEFORE:", usage);

  const { data:updateData, error:updateError } =
    await supabaseAdmin
      .from("user_usage")
      .update({
        monthly_generations_used:
          usage.monthly_generations_used + 1
      })
      .eq(
        "user_id",
        userId
      )
      .select();

  console.log(
    "PRO CREDIT UPDATE:",
    updateData,
    updateError
  );

  if(updateError){

    return {
      success:false,
      reason:updateError.message
    };

  } else {


    console.log(
  "USER ID USED FOR CREDIT:",
  userId
);


const { data:updateData, error:updateError } =
  await supabaseAdmin
    .from("user_usage")
    .update({
      daily_generations_used:
        usage.daily_generations_used + 1
    })
    .eq(
      "user_id",
      userId
    )
    .select();


console.log(
  "CREDIT UPDATE RESULT:",
  updateData,
  updateError
);


    if(updateError){

      return {
        success:false,
        reason:updateError.message
      };

    }

  }



  return {
    success:true
  };

}