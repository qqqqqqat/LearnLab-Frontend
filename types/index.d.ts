declare global {
    interface User {
        u_id: number
        u_firstname: string
        u_lastname: string
        u_tel: string
        u_email: string
        u_gender: 'MALE' | 'FEMALE' // Assuming gender can be MALE, FEMALE or OTHER
        u_role: 'STUDENT' | 'INSTRUCTOR'
        u_created_at: string
        u_updated_on: string
    }
    interface Avatar {
        u_avatar: string
        u_avatar_mime_type: string
    }
    interface Course {
        c_id: number
        c_name: string
        c_code: string
        c_hashed_password: boolean // Optional string, can be null
        c_description: string
        c_logo: string | null // Optional string, can be null
        c_banner: boolean // Optional string, can be null
        c_updated_at: string
    }

    interface CourseListing {
        page: number
        limit: number
        total_page: number
        data: Course[]
    }

    interface AuthPOSTAPIResponse {
        status: 200 | 400
        message: 'Authentication success' | 'Authentication failed'
    }

    interface JoinCoursePOSTAPIResponse {
        status: 200 | 400
        message:
            | 'รหัสคอร์สผิด กรุณาลองใหม่'
            | 'กรุณาใส่รหัส'
            | 'Invalid input'
            | 'เข้าร่วมคอร์สล้มเหลว'
            | 'เข้าร่วมคอร์สสำเร็จ'
    }

    type EnrolledCourse = number[]

    interface PostGETAPIResponse {
        data: {
            p_id: number
            p_created_at: string
            p_updated_at: string
            p_title: string
            p_content: string | null
            p_item_list: PostItemList
            p_type: 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'QUIZ'
            u_id: number
            u_role: 'TA' | 'INSTRUCTOR'
            u_firstname: string
            u_lastname: string
            u_avatar: boolean
        }[]
    }

    interface PostItemList {
        files: { f_id: number; f_name: string; f_mime_type: string }[]
        assignments: {
            a_id: number
            a_name: string
            a_due_date?: string
            a_score?: string
        }[]
        quizzes: {
            q_id: number
            q_name: string
            q_due_date?: string
            q_time_limit?: number
        }[]
    }

    interface CoursePageAPIPUTResponse {
        c_id: number
        c_name: string
        c_description: string
        c_code: string
        c_hashed_password: boolean
        c_updated_at: string
        c_created_at: string
        u_role: string
        c_privacy: 'PUBLIC' | 'PRIVATE'
        c_banner: boolean
    }
    interface CourseCreationResponse {
        status: number
        message: string
    }

    interface File {
        f_id: number
        f_name: string
        u_id: number
        f_mime_type: string | null // Allow null for cases like "Studies"
        f_type: 'FILE' | 'FOLDER'
        f_privacy: 'PUBLIC' | 'PRIVATE'
        u_firstname: string
        u_lastname: string
        created_at: string
        updated_at: string
    }

    type APIGETFilesResponse = File[]

    type UserRoles = Record<string, 'STUDENT' | 'TA' | 'INSTRUCTOR'>

    interface SubmissionData {
        u_id: number
        a_id: number
        score: number | null
        u_firstname: string
        u_lastname: string
        s_datetime: string | null
        u_avatar: boolean
    }

    interface SubmissionGETApiResponse {
        data: SubmissionData[]
        a_due_date: string | null
        a_name: string
    }

    interface GETOneSubmissionAPIResponse {
        data: {
            a_due_date: string
            a_score: number
            a_name: string
            a_id: number
            u_id: number
            c_id: number
            s_content: {
                text: string
                files: {
                    f_id: number
                    f_name: string
                    f_mime_type: string
                }[]
            }
            examiner_id: number | null
            s_feedback: string | null
            score: number | null
            s_datetime: string
            u_firstname: string
            u_lastname: string
            u_avatar: boolean
        }
    }

    interface StudentAssignmentGETResponse {
        a_id: number | null
        c_id: number
        a_name: string
        a_due_date: string | null
        a_score: number | null // Optional property for a_score
        a_files: {
            f_id: number
            f_name: string
            f_mime_type: string
        }[]
        u_id: number | null
        s_content: {
            files: {
                f_id: number
                f_name: string
                f_mime_type: string
            }[]
            text: string
        }
        examiner_id: number | null
        s_feedback: string | null
        score: number | null
        s_datetime: string | null
    }

    interface QuizAPIResponse {
        q_id: number
        c_id: number
        q_name: string
        q_begin_date: Date
        q_due_date: Date
        q_items: QuizItems[]
    }

    interface QuizItems {
        title: string
        type: 'CHOICE' | 'FILL'
        choice: string[]
    }
}

export {}
