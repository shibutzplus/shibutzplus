import { VertexAI, Part } from '@google-cloud/vertexai';
import { dbLog } from "@/services/loggerService";

/**
 * Service to interact with Google Vertex AI (Gemini)
 */
const DEFAULT_MODEL = 'gemini-2.0-flash-lite-001';

export const geminiService = {
    runGemini: async (input: string | Part[], modelName: string = DEFAULT_MODEL, generationConfig?: any) => {
        try {
            const project = process.env.GOOGLE_VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'shibutzplus';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const clientEmail = process.env.GOOGLE_VERTEX_CLIENT_EMAIL;
            const privateKey = process.env.GOOGLE_VERTEX_PRIVATE_KEY
                ? process.env.GOOGLE_VERTEX_PRIVATE_KEY.replace(/\\n/g, '\n')
                : undefined;

            const authOptions = (clientEmail && privateKey) ? {
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey
                }
            } : undefined;

            const vertex_ai = new VertexAI({
                project: project,
                location: location,
                googleAuthOptions: authOptions
            });

            const generativeModel = vertex_ai.getGenerativeModel({
                model: modelName,
                generationConfig: generationConfig
            });

            // Construct parts based on input type
            let parts;
            if (Array.isArray(input)) {
                parts = input;
            } else {
                parts = [{ text: input }];
            }

            const request = {
                contents: [{ role: 'user', parts: parts }],
            };

            const result = await generativeModel.generateContent(request);
            const response = result.response;
            const fullText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                success: true,
                text: fullText,
                raw: response
            };

        } catch (error) {
            dbLog({ description: `Error in geminiService.runGemini: ${error instanceof Error ? error.message : String(error)}` });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Generic method to generate AI response with a prompt
     */
    generateAIResponse: async (prompt: string, files: { name: string, content: string }[], useJson: boolean = true) => {
        const parts = [
            { text: prompt },
            ...files.map(f => ({ text: `### ${f.name.toUpperCase()}:\n${f.content}` }))
        ];

        const config: any = {
            maxOutputTokens: 2048,
            temperature: 0.0,
            presencePenalty: 0.2,
            frequencyPenalty: 0.8,
        };

        if (useJson) {
            config.responseMimeType = 'application/json';
            config.responseSchema = {
                type: "array",
                items: { type: "string" }
            };
        }

        return geminiService.runGemini(
            parts,
            DEFAULT_MODEL,
            config
        );
    }
};
