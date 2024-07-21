export type FolderModel = {
  name: string;
  type: string;
  expand: boolean;
  uid: string;
  rename: boolean;
  subfolders: FolderModel[];
};
