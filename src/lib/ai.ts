import axios from "axios";
import { supabase, supabaseAnonKey } from "./supabase";

class Task {
    name: string;
    description: string;
    duration: number;
    dependencies: string[];

    constructor(name: string, description: string, duration: number, dependencies: string[] = []) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.dependencies = dependencies;
    }
}

export class ProjectPlan {
    project_name: string;
    project_description: string;
    development_model: string;
    tasks: Task[];
    requirements: string[];

    constructor(project_name: string, project_description: string, development_model: string, tasks: Task[], requirements: string[]) {
        this.project_name = project_name;
        this.project_description = project_description;
        this.development_model = development_model;
        this.tasks = tasks;
        this.requirements = requirements;
    }
}



const api = axios.create({
    baseURL: "/functions/v1",
    headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
    }
});

interface Conversation {
    role: "assistant" | "user";
    content: string;
}
export const generateAIResponse = async (conversations: Conversation[]) => {
    try {
        if (import.meta.env.VITE_USE_PROXY === "true") {
            // Use proxy during development
            const response = await api.post("/generate-ai-response", conversations);
            return { data: response.data, error: null };
        } else {
            // Use Supabase function in production
            const { data, error } = await supabase.functions.invoke("generate-ai-response", {
                body: { conversations },
            });
            return { data, error };
        }
    } catch (error) {
        return { data: null, error };
    }
};

// Generate Project Plan
export const generateProjectPlan = async (conversations: Conversation[]) => {
    try {
        if (import.meta.env.VITE_USE_PROXY === "true") {
            // Use proxy during development
            const response = await api.post("/generate-project-plan", conversations);
            const { response: data, error } = response.data;
            if (error) throw error;

            const projectPlan = new ProjectPlan(
                data.project_name,
                data.project_description,
                data.development_model,
                data.tasks,
                data.requirements
            );
            return { data: projectPlan, error: null };
        } else {
            // Use Supabase function in production
            const { data, error } = await supabase.functions.invoke("generate-project-plan", {
                body: { conversations },
            });
            if (error) throw error;

            const projectPlan = new ProjectPlan(
                data.project_name,
                data.project_description,
                data.development_model,
                data.tasks,
                data.requirements
            );
            return { data: projectPlan, error: null };
        }
    } catch (error) {
        return { data: null, error };
    }
};