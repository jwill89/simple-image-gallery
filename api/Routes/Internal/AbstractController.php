<?php

namespace Routes\Internal;

use PDO;
use Gallery\Core\DatabaseConnection;
use Psr\Container\ContainerInterface;

abstract class AbstractController
{
    protected ContainerInterface $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    protected function getConnection(): PDO
    {
        return DatabaseConnection::getInstance();
    }

    protected function parseParameters(array $parameters, $parameter_name, $default_value)
    {
        return array_key_exists($parameter_name, $parameters) ? $parameters[$parameter_name] : $default_value;
    }
}
