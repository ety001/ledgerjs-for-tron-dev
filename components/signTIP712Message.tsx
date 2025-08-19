"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Terminal } from "lucide-react";
import { useGlobal } from "@/app/context/GlobalContext";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { transport } from "@/lib/client";

export default function SignTIP712Message() {
  const [result, setResult] = useState<string>("");
  const { state } = useGlobal();
  const formSchema = z.object({
    message: z.string({
      required_error: 'Message is required',
    }).trim(),
  }).required();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values, state);
    switch (state.device) {
      case 'speculos':
        if (state.speculos.deviceId === '') {
          toast.error('Please start speculos first.');
          return;
        }
        console.log('tip712msg:', JSON.parse(values.message));
        const res = await transport(state.speculos.deviceId, 'signTIP712Message', {
          path: "44'/195'/0'/0/0",
          message: JSON.parse(values.message),
        });
        if (res.status === 'error') {
          toast.error(res.msg ?? 'Failed to sign message');
          return;
        }
        if (res.signedMsg !== '') {
          setResult(`${res.signedMsg}\n\n${result}`)
        }
        setResult(res.signedMsg ?? '');
        break;
      case 'tronlink':
        await signByTronLink(values.message);
        break;
    }
  }

  
  const signByTronLink = async (msg: string) => {
    console.log('wait for developing.')
    // try {
    //   const adapter = new TronLinkAdapter();
    //   await adapter.connect();
    //   const signed = await adapter.sign(msg);
    //   setResult(`${signed}\n\n${result}`);
    //   console.log("Signed:", signed);
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          Sign Tip 712 Message
        </CardTitle>
        <CardDescription>
          Sign Tip 712 Message
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The message you want to sign."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
        {result !== '' &&
        (<Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Result</AlertTitle>
          <AlertDescription>
            <Textarea
              value={result}
              readOnly
              rows={5}
            />
          </AlertDescription>
        </Alert>)}
      </CardContent>
    </Card>
  );
}
