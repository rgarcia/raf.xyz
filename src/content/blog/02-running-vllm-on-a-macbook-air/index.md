---
title: "Running vLLM on a MacBook Air"
description: "Installing vLLM on an M4 MacBook Air"
date: "Oct 4 2025"
draft: false
---

[vLLM](https://docs.vllm.ai/) is one of the most popular libraries for running LLMs in production.
It's nice to have parity between development and production, so I thought I'd try running vLLM on my MacBook Air.
Unfortunately it requires building from source to install, so let's do that.

```bash
# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# create a directory for the project
git clone https://github.com/vllm-project/vllm.git
cd vllm

# create a venv
uv venv -p 3.12
source .venv/bin/activate

# install torch and torchvision
uv pip install torch torchvision

# build!
uv pip install -e .
```

Check that it worked:

```
vllm --version
INFO 10-03 11:07:41 [__init__.py:215] Automatically detected platform cpu.
0.1.dev1+gd76541a6c
```

## Running a model

Create a script and make it run some inference. This will automatically download the model.

```python
import os
import sys

# Replace with your vLLM installation path
vllm_path = "/Users/rafaelgarcia/code/rgarcia/vllm/"
sys.path.append(os.path.dirname(vllm_path))

# Import dependencies
import torch

os.environ.setdefault("VLLM_HOST_IP", "127.0.0.1")
from vllm import LLM, SamplingParams


def main():
    # Check for MPS availability
    use_mps = torch.backends.mps.is_available()
    device_type = "mps" if use_mps else "cpu"
    print(f"Using device: {device_type}")

    # Initialize the LLM with a small model
    llm = LLM(
        model="Qwen/Qwen2.5-0.5B-Instruct",
        # or
        # model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        download_dir="./models",
        tensor_parallel_size=1,
        trust_remote_code=True,
        enforce_eager=True,
        max_model_len=512,
        dtype="float16" if use_mps else "float32",
    )

    # Set sampling parameters
    sampling_params = SamplingParams(
        temperature=0.7,
        top_p=0.95,
        min_tokens=4,
        max_tokens=256,
    )

    # Generate text
    prompt = "Write a haiku about artificial intelligence."
    outputs = llm.generate([prompt], sampling_params)

    # Print the result
    print(outputs[0].outputs[0].text)


if __name__ == "__main__":
    main()
```

Or alternatively, you can serve it as an OpenAI-compatible API:

```bash
VLLM_HOST_IP=127.0.0.1 VLLM_USE_CUDA=0 vllm serve Qwen/Qwen3-1.7B \
    --tensor-parallel-size 1 \
    --host 0.0.0.0 \
    --port 8000 \
    --dtype float16 \
    --max-model-len 20000 \
    --max-num-batched-tokens 20000
```

On my Macbook Air I had to adjust the `max-model-len` and `max-num-batched-tokens` to 20000 since I was getting an error:

```bash
ValueError: To serve at least one request with the models's max seq len (40960), (4.38 GiB KV cache is needed, which is larger than the available KV cache memory (4.00 GiB). Based on the available memory, the estimated maximum model length is 37440. Try increasing `gpu_memory_utilization` or decreasing `max_model_len` when initializing the engine.
```

Since the API is OpenAI-compatible, you can use the OpenAI SDK to make requests:

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-your-api-key", // vLLM does not require an API key, but the client expects one. You can use any placeholder.
  baseURL: "http://localhost:8000/v1",
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: 'How many Rs in the word "strawberry"?' },
    ],
    model: "Qwen/Qwen3-1.7B", // Use the model name served by vLLM
  });

  console.log(chatCompletion.choices[0].message.content);
}

main();
```

Happy hacking!
