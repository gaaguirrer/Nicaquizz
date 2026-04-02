/**
 * Entidad de Pregunta del Dominio
 */

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export class QuestionEntity {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: string[],
    public readonly correctAnswer: number,
    public readonly categoryId: string,
    public readonly createdBy: string,
    public readonly difficulty: QuestionDifficulty,
    public readonly status: QuestionStatus = 'pending',
    public readonly approvedBy?: string,
    public readonly approvedAt?: string,
    public readonly createdAt: string = new Date().toISOString()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.text || this.text.length < 10) {
      throw new Error('La pregunta debe tener al menos 10 caracteres');
    }

    if (this.options.length !== 4) {
      throw new Error('La pregunta debe tener exactamente 4 opciones');
    }

    if (this.correctAnswer < 0 || this.correctAnswer > 3) {
      throw new Error('La respuesta correcta debe ser un índice entre 0 y 3');
    }

    const validDifficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(this.difficulty)) {
      throw new Error('Dificultad no válida');
    }
  }

  static fromObject(data: Record<string, unknown>): QuestionEntity {
    return new QuestionEntity(
      data.id as string,
      data.text as string,
      data.options as string[],
      data.correctAnswer as number,
      data.categoryId as string,
      data.createdBy as string,
      data.difficulty as QuestionDifficulty,
      (data.status as QuestionStatus) || 'pending',
      data.approvedBy as string | undefined,
      data.approvedAt as string | undefined,
      (data.createdAt as string) || new Date().toISOString()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      text: this.text,
      options: this.options,
      correctAnswer: this.correctAnswer,
      categoryId: this.categoryId,
      createdBy: this.createdBy,
      difficulty: this.difficulty,
      status: this.status,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      createdAt: this.createdAt
    };
  }

  approve(approvedBy: string): QuestionEntity {
    return new QuestionEntity(
      this.id,
      this.text,
      this.options,
      this.correctAnswer,
      this.categoryId,
      this.createdBy,
      this.difficulty,
      'approved',
      approvedBy,
      new Date().toISOString(),
      this.createdAt
    );
  }

  reject(): QuestionEntity {
    return new QuestionEntity(
      this.id,
      this.text,
      this.options,
      this.correctAnswer,
      this.categoryId,
      this.createdBy,
      this.difficulty,
      'rejected',
      this.approvedBy,
      this.approvedAt,
      this.createdAt
    );
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isApproved(): boolean {
    return this.status === 'approved';
  }

  isRejected(): boolean {
    return this.status === 'rejected';
  }

  getOptionsWithIndices(): { index: number; text: string }[] {
    return this.options.map((option, index) => ({ index, text: option }));
  }

  isCorrectAnswer(index: number): boolean {
    return index === this.correctAnswer;
  }
}
