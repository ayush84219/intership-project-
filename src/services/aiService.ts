import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Drafts a personalized cover letter using Google Gemini AI or a high-quality fallback template
 */
export async function draftCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  candidateName: string,
  candidateDegree: string,
  candidateSkills: string
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== "" && !geminiKey.startsWith("YOUR_")) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an AI assistant writing a personalized, highly professional internship cover letter.
        Candidate Name: ${candidateName}
        Degree/Specialization: ${candidateDegree}
        Skills: ${candidateSkills}

        Internship Details:
        Role: ${jobTitle}
        Company: ${companyName}
        Description: ${jobDescription.substring(0, 800)}...

        Write a short, engaging, and professional 3-paragraph cover letter (maximum 200 words) tailored to this specific internship. Highlight how the candidate's skills match the role requirements.
        Do not include placeholders like [Date], [Address], or brackets.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text && text.trim() !== "") {
        return text.trim();
      }
    } catch (e) {
      console.warn("Failed to generate cover letter with Gemini, using fallback template:", e);
    }
  }

  // Fallback Template
  return `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position. As a student pursuing a degree in ${candidateDegree}, I am eager to apply my academic foundation and technical capabilities in a real-world setting.

I possess hands-on experience in areas such as ${candidateSkills}. I have worked on projects that align closely with the tasks outlined in your internship description. I am particularly drawn to ${companyName} because of your innovation in the industry and commitment to growth.

I am confident that my skills, coupled with my enthusiasm and drive to learn, will make me a valuable addition to your team. Thank you for your time and consideration.

Sincerely,
${candidateName}`;
}

/**
 * Handles AI Chatbot answers via SerpApi Google AI Mode or fallback responses
 */
export async function getAIChatReply(message: string): Promise<{ reply: string; source: string }> {
  const serpapiKey = process.env.SERPAPI_API_KEY;

  if (serpapiKey && serpapiKey !== "" && !serpapiKey.startsWith("YOUR_")) {
    try {
      const searchUrl = `https://serpapi.com/search.json?engine=google_ai_mode&q=${encodeURIComponent(message.trim())}&api_key=${serpapiKey}`;
      const response = await fetch(searchUrl, { method: "GET" });

      if (response.ok) {
        const result = await response.json();
        if (result.reconstructed_markdown) {
          return {
            reply: result.reconstructed_markdown,
            source: "serpapi_ai_mode"
          };
        } else if (result.error) {
          return {
            reply: `**SerpApi Error:** ${result.error}\n\n*Falling back to default query assistance.*`,
            source: "serpapi_error"
          };
        }
      }
    } catch (apiError) {
      console.error("Failed querying SerpApi AI Overview:", apiError);
    }
  }

  // Fallback Responses
  const lowerMessage = message.toLowerCase();
  let reply = "";

  if (lowerMessage.includes("coffee")) {
    reply = `### Coffee Spots & Info (Simulated Overview)
Here are some popular coffee spots you can check out:
- **Starbucks**: Known globally, perfect for classic espresso drinks and seasonal items.
- **Window Seat Coffee**: An aviation-themed spot with a great study atmosphere.
- **Cafe Duro**: A Milan-inspired European cafe serving premium espresso and baked goods.

*Note: This is a simulated response because the SerpApi key was either unavailable or the API call timed out.*`;
  } else if (lowerMessage.includes("internship") || lowerMessage.includes("job")) {
    reply = `### Internship Search Tips
To search for the latest internships on this portal:
1. Go to the **Find Internships** dashboard tab.
2. Select your platform under **Source Platforms** (e.g. Naukri.com, Internshala.com, Apna.com, or Shine.com).
3. Type keywords in the search bar (like *"React Developer"* or *"HR Intern"*) and press Enter.
4. Click **Quick Apply** on any card to trigger our automated AI application generator!`;
  } else {
    reply = `### Google AI Assistant (Offline Mode)
Hello! I can answer your questions using Google's live **AI Overviews** (Search Generative Experience) via SerpApi.

Currently, I'm running in offline mode. If you enter a question about **Coffee** or **Internships**, I can provide general guidance. 

**To enable live AI answers:**
Please ensure "SERPAPI_API_KEY" is added to your ".env" file and restart your Next.js dev server.`;
  }

  return { reply, source: "mock_fallback" };
}
