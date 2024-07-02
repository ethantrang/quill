import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";

import { OpenAIEmbeddings } from "@langchain/openai";
import { Upload } from "lucide-react";

const f = createUploadthing();


export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {

      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/a/${process.env.UPLOADTHING_APP_ID}/${file.key}`,
          uploadStatus: "PROCESSING",
        }
      })

      try {
        const response = await fetch(`https://utfs.io/a/${process.env.UPLOADTHING_APP_ID}/${file.key}`)
        const blob = await response.blob()

        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length

        // vectorize and index entire document

        const pineconeIndex = pinecone.Index("quill")

        const embeddings = new OpenAIEmbeddings({
          apiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(
          pageLevelDocs,
          embeddings,
          {
            pineconeIndex,
            namespace: createdFile.id,
          }
        )

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          }
        })

      } catch (error) {

        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          }
        })

      }

    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;