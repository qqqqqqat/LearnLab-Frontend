declare global {
    interface User {
        u_id: number;
        u_firstname: string;
        u_lastname: string;
        u_tel: string;
        u_email: string;
        u_gender: "MALE" | "FEMALE"; // Assuming gender can be MALE, FEMALE or OTHER
        u_role: string;
        u_created_at: string;
        u_updated_on: string;
      }
      interface Avatar {
        u_avatar: string;
        u_avatar_mime_type: string;
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
      status: 200 | 400;
      message:  "Authentication success" | "Authentication failed";
    }
    
    interface JoinCoursePOSTAPIResponse {
      status: 200 | 400;
      message:  "รหัสคอร์สผิด กรุณาลองใหม่" | "กรุณาใส่รหัส" | "Invalid input" | 'เข้าร่วมคอร์สล้มเหลว' | 'เข้าร่วมคอร์สสำเร็จ';
    }

    type EnrolledCourse = number[];

    interface PostGETAPIResponse {
      page: number;
      limit: number;
      total_page: number;
      data: {
        p_id: number;
        p_created_at: string;
        p_updated_at: string;
        p_title: string;
        p_content: string;
        p_item_list: string;
        p_type: string;
        u_id: number;
        u_role: 'TA' | 'INSTRUCTOR';
        u_firstname: string;
        u_lastname: string;
        u_avatar: boolean;
      }[];
    }
    
    
}

export {};