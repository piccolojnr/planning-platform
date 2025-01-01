import { supabase } from "./supabase";

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
    overview: string;

    constructor(project_name: string, project_description: string, development_model: string, tasks: Task[], requirements: string[], overview: string) {
        this.project_name = project_name;
        this.project_description = project_description;
        this.development_model = development_model;
        this.tasks = tasks;
        this.requirements = requirements;
        this.overview = overview;
    }
}




interface Conversation {
    role: "assistant" | "user";
    content: string;
}
export const generateAIResponse = async (conversations: Conversation[]) => {
    try {

        const { data, error } = await supabase.functions.invoke("generate-ai-response", {
            body: conversations,
        });
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

// Generate Project Plan
export const generateProjectPlan = async (conversations: Conversation[]) => {
    try {

        // Use Supabase function in production
        const { data, error } = await supabase.functions.invoke("generate-project-plan", {
            body: conversations,
        });
        if (error) throw error;
        const { response } = data;


        const projectPlan = new ProjectPlan(
            response.project_name,
            response.project_description,
            response.development_model,
            response.tasks,
            response.requirements,
            response.overview
        );
        return { data: projectPlan, error: null };
    } catch (error) {
        return { data: null, error };
    }
};