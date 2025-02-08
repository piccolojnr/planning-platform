export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            chat_messages: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    project_id: string | null;
                    role: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    project_id?: string | null;
                    role: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    project_id?: string | null;
                    role?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "chat_messages_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                ];
            };
            feedback: {
                Row: {
                    created_at: string;
                    description: string;
                    id: string;
                    status: string;
                    title: string;
                    type: string;
                    updated_at: string;
                    user_id: string | null;
                    votes: number | null;
                };
                Insert: {
                    created_at?: string;
                    description: string;
                    id?: string;
                    status?: string;
                    title: string;
                    type: string;
                    updated_at?: string;
                    user_id?: string | null;
                    votes?: number | null;
                };
                Update: {
                    created_at?: string;
                    description?: string;
                    id?: string;
                    status?: string;
                    title?: string;
                    type?: string;
                    updated_at?: string;
                    user_id?: string | null;
                    votes?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "feedback_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            feedback_votes: {
                Row: {
                    created_at: string;
                    feedback_id: string | null;
                    id: string;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string;
                    feedback_id?: string | null;
                    id?: string;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string;
                    feedback_id?: string | null;
                    id?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "feedback_votes_feedback_id_fkey";
                        columns: ["feedback_id"];
                        isOneToOne: false;
                        referencedRelation: "feedback";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "feedback_votes_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            projects: {
                Row: {
                    created_at: string | null;
                    description: string | null;
                    id: string;
                    model: string;
                    overview: string | null;
                    title: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    description?: string | null;
                    id?: string;
                    model?: string;
                    overview?: string | null;
                    title: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    description?: string | null;
                    id?: string;
                    model?: string;
                    overview?: string | null;
                    title?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "projects_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            requirements: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    project_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    project_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    project_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "requirements_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                ];
            };
            shared_projects: {
                Row: {
                    created_at: string | null;
                    id: string;
                    project_id: string;
                    role: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    project_id: string;
                    role?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    project_id?: string;
                    role?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "shared_projects_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "shared_projects_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            subtasks: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    order: number;
                    status: string;
                    task_id: string | null;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    order?: number;
                    status?: string;
                    task_id?: string | null;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    order?: number;
                    status?: string;
                    task_id?: string | null;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "subtasks_task_id_fkey";
                        columns: ["task_id"];
                        isOneToOne: false;
                        referencedRelation: "tasks";
                        referencedColumns: ["id"];
                    },
                ];
            };
            task_requirements: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    task_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    task_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    task_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "task_requirements_task_id_fkey";
                        columns: ["task_id"];
                        isOneToOne: false;
                        referencedRelation: "tasks";
                        referencedColumns: ["id"];
                    },
                ];
            };
            tasks: {
                Row: {
                    created_at: string | null;
                    dependencies: Json | null;
                    description: string | null;
                    duration: number;
                    id: string;
                    order: number;
                    project_id: string;
                    status: string;
                    title: string;
                    updated_at: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    dependencies?: Json | null;
                    description?: string | null;
                    duration?: number;
                    id?: string;
                    order?: number;
                    project_id: string;
                    status?: string;
                    title: string;
                    updated_at?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    dependencies?: Json | null;
                    description?: string | null;
                    duration?: number;
                    id?: string;
                    order?: number;
                    project_id?: string;
                    status?: string;
                    title?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "tasks_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            users: {
                Row: {
                    email: string | null;
                    id: string | null;
                };
                Insert: {
                    email?: string | null;
                    id?: string | null;
                };
                Update: {
                    email?: string | null;
                    id?: string | null;
                };
                Relationships: [];
            };
        };
        Functions: {
            delete_last_chat: {
                Args: {
                    p_project_id: string;
                };
                Returns: undefined;
            };
            override_project_data:
                | {
                    Args: {
                        p_project_id: string;
                        p_name: string;
                        p_description: string;
                        p_tasks: Json;
                        p_requirements: Json;
                    };
                    Returns: undefined;
                }
                | {
                    Args: {
                        p_project_id: string;
                        p_name: string;
                        p_description: string;
                        p_tasks: Json;
                        p_requirements: Json;
                        p_overview: string;
                    };
                    Returns: undefined;
                };
            override_subtasks: {
                Args: {
                    p_task_id: string;
                    p_subtasks: Json;
                };
                Returns: undefined;
            };
            reset_conversation: {
                Args: {
                    p_project_id: string;
                };
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends
        { schema: keyof Database } ? keyof (
            & Database[PublicTableNameOrOptions["schema"]]["Tables"]
            & Database[PublicTableNameOrOptions["schema"]]["Views"]
        )
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? (
        & Database[PublicTableNameOrOptions["schema"]]["Tables"]
        & Database[PublicTableNameOrOptions["schema"]]["Views"]
    )[TableName] extends {
        Row: infer R;
    } ? R
    : never
    : PublicTableNameOrOptions extends keyof (
        & PublicSchema["Tables"]
        & PublicSchema["Views"]
    ) ? (
            & PublicSchema["Tables"]
            & PublicSchema["Views"]
        )[PublicTableNameOrOptions] extends {
            Row: infer R;
        } ? R
        : never
    : never;

export type TablesInsert<
    PublicTableNameOrOptions extends
        | keyof PublicSchema["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends
        { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends
        {
            Insert: infer I;
        } ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
        ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
            Insert: infer I;
        } ? I
        : never
    : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends
        | keyof PublicSchema["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends
        { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends
        {
            Update: infer U;
        } ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
        ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
            Update: infer U;
        } ? U
        : never
    : never;

export type Enums<
    PublicEnumNameOrOptions extends
        | keyof PublicSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
        ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof PublicSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]][
            "CompositeTypes"
        ]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][
        CompositeTypeName
    ]
    : PublicCompositeTypeNameOrOptions extends
        keyof PublicSchema["CompositeTypes"]
        ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
