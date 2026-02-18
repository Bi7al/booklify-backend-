import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {



    const prompt = `Analyze the Image and recommend books based on the interests enclosed in """. Recommend the top 3 books based on these interests. If the Books dont match the interests or if the image does not contain any book titles reply : No Relevent Interests Found.   
    """${interests}"""
    The Output should be in the JSON format:
    [{
        title:"Book Title",
        description:"Short Description of the Book"
    }]
    
    Return ONLY valid JSON.
    Do not include markdown.
    Do not include explanation text.
        `



    res.setHeader("Access-Control-Allow-Origin", "*"); // or your frontend URL
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");


    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method != "POST") {
        return res.status(405).json({ error: "Only Post Requests are Allowed" });
    }

    try {


        const form = formidable();

        const [fields, files] = await form.parse(req);

        const image = files.uploadedImage?.[0];
        const interests = fields.interests?.[0];

        if (!image) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const buffer = fs.readFileSync(image.filepath);





        const genAI = new GoogleGenerativeAI("AIzaSyDjCDno_4jTGKIUvLzJ_tBzlfN3TmEaeDQ");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: image.type,
                    data: buffer.toString("base64"),
                },
            },
        ]

        )

        const text = result.response.text();
        return res.status(200).json(JSON.parse(text))


    }
    catch (err) {

        console.error(err);
        res.status(500).json({ error: "Gemini failed" });

    }

}