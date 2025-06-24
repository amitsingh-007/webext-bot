export interface ICheckOutput {
  title: string;
  message: string;
  conclusion: 'success' | 'failure';
}

export interface ICreateCheckOutput {
  checkId: number;
  detailsUrl: string | undefined;
}
