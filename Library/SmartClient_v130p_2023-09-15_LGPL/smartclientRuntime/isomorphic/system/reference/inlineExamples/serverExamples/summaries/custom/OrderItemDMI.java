//----------------------------------------------------------------------
// Isomorphic SmartClient
//
// Custom Aggregation sample
//----------------------------------------------------------------------

package com.isomorphic.examples.server.summaries;

import com.isomorphic.datasource.DSRequest;
import com.isomorphic.datasource.DSResponse;
import com.isomorphic.log.Logger;
import com.isomorphic.util.DataTools;
import java.util.*;

public class OrderItemDMI {

    private static Logger log = new Logger(OrderItemDMI.class.getName());

    public DSResponse fetch(DSRequest req) throws Exception {

        // check if custom aggregation is needed
        Map<String, String> summaryFunctions = req.getRawSummaryFunctions();
        boolean hasCustomFunction = false;
        for (String functionName: summaryFunctions.values()) {
            if ("countDistinct".equals(functionName) || "concatDistinct".equals(functionName)) {
                hasCustomFunction = true;
                break;
            }
        }

        // if no custom functions involved execute request normally, otherwise continue with manual aggregation
        if (!hasCustomFunction) {
            return req.execute();
        }

        // get all data via separate request
        List data = new DSRequest(req.getDataSource(), "fetch").execute().getDataList();

        // sort data by groupBy fields
        List<String> groupFields = req.getGroupBy();
        data.sort(new Comparator<Map<String, Object>>() {
            @Override
            public int compare(Map<String,Object> o1, Map<String,Object> o2) {
                for (String field: groupFields) {
                    int res = 0;
                    Object v1 = o1.get(field);
                    Object v2 = o2.get(field);
                    if (v1 instanceof String) res = ((String) v1).compareTo((String) v2);
                    if (v1 instanceof Date) res = ((Date) v1).compareTo((Date) v2);
                    if (res != 0) return res;
                }
                return 0;
            }
        });

        // group data by groupBy fields
        List aggregatedData = new ArrayList();
        Map lastRecord = null;
        for (Map record: (List<Map>) data) {
            // detect next record
            boolean nextRecord = (lastRecord == null);
            for (String field: groupFields) {
                if (nextRecord) break;
                nextRecord = !lastRecord.get(field).equals(record.get(field));
            }

            // create next record
            if (nextRecord) {
                lastRecord = new HashMap();
                aggregatedData.add(lastRecord);
                for (String field: groupFields) {
                    lastRecord.put(field, record.get(field));
                }
            }

            // add data that will be aggregated
            for (String field: summaryFunctions.keySet()) {
                List list = (List) lastRecord.get(field);
                if (list == null) {
                    list = new ArrayList();
                    lastRecord.put(field, list);
                }
                list.add(record.get(field));
            }
        }

        // apply summaryFunctions to grouped data
        for (Map record: (List<Map>) aggregatedData) {
            for (String field: summaryFunctions.keySet()) {
                String function = summaryFunctions.get(field);
                List values = (List) record.get(field);
                if ("count".equals(function)) {
                    // replace list of values with count
                    record.put(field, values.size());
                } else if ("countDistinct".equals(function)) {
                    // replace list of values with unique values count
                    List uniqueValues = new ArrayList();
                    for (Object value: values) {
                        if (!uniqueValues.contains(value)) uniqueValues.add(value);
                    }
                    record.put(field, uniqueValues.size());
                } else if ("concatDistinct".equals(function)) {
                    // replace list of values with unique values concatenated
                    List seen = new ArrayList();
                    String result = "";
                    for (Object value: values) {
                        if (!seen.contains(value)) {
                            seen.add(value);
                            result += ("".equals(result) ? value : ", " + value);
                        }
                    }
                    record.put(field, result);
                }
            }
        }

        return new DSResponse(aggregatedData);
    }
}
