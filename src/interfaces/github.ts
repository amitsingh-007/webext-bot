export interface ICheckOutput {
  title: string;
  message: string;
  conclusion: string;
}

export interface ICreateCheckOutput {
  checkId: number;
  detailsUrl: string | null;
}
