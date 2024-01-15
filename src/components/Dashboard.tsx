"use client";
/*
  This file contains the Dashboard component, which is a part of our web application.
  
  Summary:
  - The Dashboard fetches and displays a user's files.
  - It includes an upload button for adding new files.
  - Each file is shown with details like name, creation date, and a delete button.
  - Loading placeholders are displayed during file loading.
  - If no files are present, a message encourages the user to upload their first PDF.

  Components and Dependencies:
  - trpc for making queries and mutations to the server.
  - Icons from lucide-react for visual representation.
  - Skeketon for loading placeholders.
  - Next.js Link for navigation.
  - date-fns for formatting dates.
  - Custom Button component for UI consistency.

  Note: The code is written in a modular and readable manner, making it easy to understand and maintain.
*/

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { link } from "fs";
import Link from "next/link";
import {format} from "date-fns"
import { Button } from "./ui/button";
import { useState } from "react";

const Dashboard = () => {

  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)
  const { data: files, isLoading } = trpc.getUserFiles.useQuery(); // request made to the server for information on files

  const utils = trpc.useContext()


  const { mutate: deleteFile } =  trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate() //triggers the refresh of the page after deletion 
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
    }) //mutation operation (update/delete info)

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4  border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">All Files</h1>
        <UploadButton />
      </div>

      {/* -- Display all the foles of the user here -- */}
      {files && files.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => ( // iterate over each file in files array
              <li
                key={file.id} // unique id 
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-green-500" />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='truncate text-lg font-medium text-zinc-900'>
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(
                      new Date(file.createdAt),
                      'MMM yyyy'
                    )}
                  </div>
                  

                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    mocked
                  </div>

                  <Button onClick={() =>
                      deleteFile({ id: file.id }) // unique idenfier file deleted from the server
                    }
                    size='sm'
                    className='w-full'
                    variant='destructive'>
                      {currentlyDeletingFile === file.id ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                      )}
                  </Button>
                  </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2 " count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">No files to show</h3>
          <p>Let&apos;s upload your first PDF to TalkifyDocs. </p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
