// app/teacher/courses/[id]/preview/page.tsx
'use client';
import StudentCourseDetailPage from '@/app/student/courses/[courseId]/page';

export default function TeacherCoursePreviewPage() {
    return <StudentCourseDetailPage />;
}
