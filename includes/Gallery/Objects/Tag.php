<?php

namespace Gallery\Objects;

class Tag
{
    public int $id;
    public string $tag;

    private function __construct(int $id, string $tag)
    {
        $this->id = $id;
        $this->tag = $tag;
    }
}