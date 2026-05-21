export type BlockType = 'story' | 'text' | 'image_ab' | 'fill_blank' | 'tip' | 'quiz' | 'image' | 'scenario' | 'bio_builder' | 'exercise' | 'challenge' | 'cloze' | 'match' | 'drag_drop' | 'insta_bio' | 'pain_calculator' | 'mistake_example' | 'commitment_contract' | 'safe_share_prep' | 'reflection_moment' | 'unit_reflection' | 'certificate_unlock';

export interface BaseBlock {
  type: BlockType;
  audio?: string;
}

export interface BioBuilderBlock extends BaseBlock {
  type: 'bio_builder';
  prompt: string;
}

export interface StoryBlock extends BaseBlock {
  type: 'story';
  character: string;
  content: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface ImageABBlock extends BaseBlock {
  type: 'image_ab';
  label: string;
  option_a: { src: string; label: string; };
  option_b: { src: string; label: string; };
  correct: 'A' | 'B';
  feedback_correct: string;
  feedback_wrong: string;
}

export interface FillBlankBlock extends BaseBlock {
  type: 'fill_blank';
  prompt: string;
  sentence: string;
  blanks: number;
  options: string[];
  correct: string[];
  feedback: string;
}

export interface ClozeBlock extends BaseBlock {
  type: 'cloze';
  prompt: string;
  sentence_with_blank: string;
  options: string[];
  correct: string;
  feedback: string;
}

export interface MatchBlock extends BaseBlock {
  type: 'match';
  prompt: string;
  pairs: {left: string, right: string}[];
  feedback: string;
}

export interface DragDropBlock extends BaseBlock {
  type: 'drag_drop';
  prompt: string;
  items: { id: string; text: string }[];
  correct_order: string[]; // array of ids
  feedback: string;
  design_context?: 'instagram_bio' | 'general';
}

export interface TipBlock extends BaseBlock {
  type: 'tip';
  content: string;
}

export interface QuizBlock extends BaseBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correct_index: number;
  feedback: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  caption?: string;
}

export interface ScenarioBlock extends BaseBlock {
  type: 'scenario';
  label: string;
  setup: string;
  chat: { side: 'left' | 'right'; speaker: string; text: string }[];
  options: string[];
  correct_index: number;
  feedback: string;
}

export interface ExerciseBlock extends BaseBlock {
  type: 'exercise';
  prompt: string;
  placeholder: string;
  example: string;
}

export interface ChallengeBlock extends BaseBlock {
  type: 'challenge';
  title: string;
  difficulty: string;
  task: string;
  reward_xp: number;
}

export interface InstaBioBlock extends BaseBlock {
  type: 'insta_bio';
  prompt: string;
  blanks: number;
  options: string[];
  correct: string[]; // array of ids/strings
  feedback: string;
}

export interface PainCalculatorBlock extends BaseBlock {
  type: 'pain_calculator';
  prompt: string;
  inputs: { key: string; label: string; placeholder: string }[];
  calculation_formula: string;
  result_template: string;
  call_to_action: string;
}

export interface MistakeExampleBlock extends BaseBlock {
  type: 'mistake_example';
  bad_example: string;
  good_example: string;
  question: string;
  correct: 'bad_example' | 'good_example';
  feedback: string;
}

export interface CommitmentContractBlock extends BaseBlock {
  type: 'commitment_contract';
  title: string;
  instruction: string;
  prompt_fields: { key: string; label: string; placeholder?: string; type?: string }[];
  signature_required?: boolean;
  signature_label?: string;
  completion_message: string;
  xp_reward?: number;
}

export interface SafeSharePrepBlock extends BaseBlock {
  type: 'safe_share_prep';
  title: string;
  instruction: string;
  prompt_fields: { key: string; label: string; placeholder: string }[];
  reassurance_message: string;
  xp_reward?: number;
}

export interface CertificateUnlockBlock extends BaseBlock {
  type: 'certificate_unlock';
  title: string;
  badge_earned?: string;
  message: string;
}

export interface UnitReflectionBlock extends BaseBlock {
  type: 'unit_reflection';
  title: string;
  prompt: string;
  options: string[];
  correct_index: number;
  feedback: string;
}

export interface ReflectionMomentBlock extends BaseBlock {
  type: 'reflection_moment';
  title: string;
  prompt: string;
  options: string[];
  correct_index: number;
  feedback: string;
}

export interface PaymentVerificationScenarioBlock extends BaseBlock {
  type: 'payment_verification_scenario';
  label: string;
  setup: string;
  options: string[];
  correct_index: number;
  feedback: string;
}

export type LessonBlock = StoryBlock | TextBlock | ImageABBlock | FillBlankBlock | TipBlock | QuizBlock | ImageBlock | ScenarioBlock | BioBuilderBlock | ExerciseBlock | ChallengeBlock | ClozeBlock | MatchBlock | DragDropBlock | InstaBioBlock | PainCalculatorBlock | MistakeExampleBlock | CommitmentContractBlock | SafeSharePrepBlock | ReflectionMomentBlock | UnitReflectionBlock | PaymentVerificationScenarioBlock | CertificateUnlockBlock;

export interface Lesson {
  lesson_id: number;
  title: string;
  xp: number;
  duration_min: number;
  mission: string;
  blocks: LessonBlock[];
}

export interface Unit {
  unit_id: number;
  unit_title: string;
  unit_icon: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  course_id: string;
  course_title: string;
  category: string;
  language: string;
  level: string;
  xp_total: number;
  estimated_minutes: number;
  units: Unit[];
}
