"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";

export default function QrModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        title="Открыть QR"
      >
        <QrCode className="w-5 h-5" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" leave="ease-in duration-200"
            enterFrom="opacity-0" enterTo="opacity-100"
            leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center">
            <Dialog.Panel className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Отсканируйте QR-код
              </Dialog.Title>
              <QRCodeCanvas value={url} size={256} />
              <div className="mt-4 text-center text-sm text-slate-500">{url}</div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  Закрыть
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
