export type Folder = {
  name: string;
  type: string;
  uid: string;
  subfolder: Folder[];
};
