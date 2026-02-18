import { GoogleGenerativeAI } from "@google/generative-ai";



export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*"); // or your frontend URL
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method != "POST") {
        return res.status(405).json({ error: "Only Post Requests are Allowed" });
    }

    try {
        const formData = await req.formData()
        const image = formData.get("uploadedImage");
        if (!image) {
            return res.status(400).json({ error: "No image uploaded" });
        }
        const interests = formData.get("interests");

        const prompt = `Analyze the Image and recommend books based on the interests enclosed in """. Recommend the top 3 books based on these interests. If the Books dont match the interests or if the image does not contain any book titles reply : No Relevent Interests Found.
        
        """${interests}"""
        The Output should be in the JSON format:
        [{
            title:"Book Title",
            description:"Short Description of the Book"
        }]
        `

        const buffer = Buffer.from(await image.arrayBuffer());


        const genAI = new GoogleGenerativeAI(apiKey = "AIzaSyDjCDno_4jTGKIUvLzJ_tBzlfN3TmEaeDQ");
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