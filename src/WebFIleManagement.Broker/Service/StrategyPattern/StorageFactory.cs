using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebFIleManagement.Broker.Service.Interfaces;

namespace WebFIleManagement.Broker.Service.StrategyPattern;

public class StorageFactory
{
    public static IStorageBroker GetStorageBroker(StorageType storageType)
    {
        return storageType switch
        {
            StorageType.Local => new LocalStorageBroker(),
           // StorageType.Azure => new AzureStorageBroker(),
           // StorageType.Amazon => new AmazonStorageBroker(),
            _ => throw new ArgumentException("Invalid storage type")
        };
    }
}
