import axios from "axios";
import { inngest } from "./client";
import { prisma } from "@/lib/db";

export const genaiFunction = inngest.createFunction(
  { id: "genai-backend" },
  { event: "genai.backend/run" },
  async ({ event, step }) => {

    await step.run("get-genai-content", async () => {
        // const question_response = await axios.post("http://localhost:3000/api/mcq",{
        //     video_id : event.data.video_id
        // })
        const question_response = await axios.post(`${process.env.FASTAPI_URL}/generate_mcq`,{
            video_id : event.data.video_id
        })
        
        const questions = question_response.data.mcqs;
        console.log("FULL RESPONSE : " , question_response.data);

        await prisma.question.createMany({
            data : questions.map((q : any) => ({
                question : q.question,
                options : q.options,
                answer : q.answer,
                videoId : event.data.video_id
            }))
        })

        await prisma.video.update({
            where : {videoid : event.data.video_id },
            data  : {status  : "COMPLETED"}
        })
    })

  },
);