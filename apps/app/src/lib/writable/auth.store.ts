import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "$lib/firebase";
import { db } from "$lib/db/db";

export const user = writable<User | null>(null);
export const authLoading = writable<boolean>(true);

if (typeof window !== "undefined") {
  auth.onAuthStateChanged((u) => {
    user.set(u);
    authLoading.set(false);

    if (u) {
      // Seed default petstore sequence example if newly logged in or signed up
      const seedKey = `flexiberry:seededPetstore:${u.uid}`;
      if (localStorage.getItem(seedKey) !== "true") {
        db.fileStore
          .where("workspaceId")
          .equals("default")
          .and((f) => f.name === "petstore.berry")
          .first()
          .then((existingFile) => {
            if (!existingFile) {
              const fileContent = `## ---------------------------------------------------------
## SWAGGER PETSTORE SEQUENCE EXAMPLE
## ---------------------------------------------------------

Var @UAT Petstore Settings
- baseUrl: 'https://petstore.swagger.io/v2'
- petId: '987654321'

Api POST #addPet Add a new pet to the store
Url {{baseUrl}}/pet
Header
- Content-Type: 'application/json'
Body JSON \`
{
  "id": {{petId}},
  "category": {
    "id": 0,
    "name": "string"
  },
  "name": "BerryDoggie",
  "photoUrls": [
    "string"
  ],
  "tags": [
    {
      "id": 0,
      "name": "active-test"
    }
  ],
  "status": "available"
}
\`

Api GET #getPetById Find pet by ID
Url {{baseUrl}}/pet/{{petId}}
Header
- Accept: 'application/json'

Task Add Pet and Find Sequence

Step Call Api addPet
    Capture
    - createdId: response.id
    - createdName: response.name
    Check
    - $.status == 200 OR $.status == 201
    - response.id != null
    - response.name == 'BerryDoggie'

Step Call Api getPetById
    Params
    - petId: Step.1.createdId
    Capture
    - petName: response.name
    Check
    - $.status == 200
    - response.name == Step.1.createdName`;

              db.fileStore
                .add({
                  name: "petstore.berry",
                  data: new Blob([fileContent], { type: "text/plain" }),
                  createdAt: new Date(),
                  workspaceId: "default",
                  folderId: null,
                } as any)
                .then(() => {
                  localStorage.setItem(seedKey, "true");
                })
                .catch((err) => {
                  console.error("Failed to seed default petstore sequence file:", err);
                });
            } else {
              localStorage.setItem(seedKey, "true");
            }
          })
          .catch((err) => {
            console.error("Error checking/seeding petstore.berry:", err);
          });
      }
    }
  });
}
