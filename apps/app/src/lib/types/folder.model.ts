export type FolderModel = {
  name: string;
  type: string;
  expand: boolean;
  remove: boolean;
  uid: string;
  rename: boolean;
  subfolders: FolderModel[];
};
