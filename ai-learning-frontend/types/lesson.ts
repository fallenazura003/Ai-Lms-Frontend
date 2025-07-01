export interface LessonResponse {
    id: string;
    title: string;
    youtubeVideoId?: string; // Optional vì có thể không có video
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    isRecallQuestionCompleted: boolean;
    isMaterialCompleted: boolean;
    isShortAnswerCompleted: boolean;
    isMultipleChoiceCompleted: boolean;
    isSummaryTaskCompleted: boolean;
    isLessonCompleted: boolean;
    courseId: string;
    lessonOrder: number;
}

