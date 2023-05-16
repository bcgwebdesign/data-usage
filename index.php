<?php
    $submitted = false;
    if(isset($_POST['post-submitted']) 
        || ($_COOKIE['remaining'] && $_COOKIE['allowance'] && $_COOKIE['reserve'] && $_COOKIE['renew-date'])) {

        $submitted = true;


        if (isset($_POST['post-submitted'])) {
            $dataRemaining = $_POST['remaining'];
            $dataAllowance = $_POST['allowance'];
            $dataReserve = $_POST['reserve'];
            $renewDate = $_POST['renew-date']  ;
        } else {        
            if ($_COOKIE['remaining']) {
                $dataRemaining = $_COOKIE['remaining'];
            } else {
                $dataRemaining = '';
            }        
            if ($_COOKIE['allowance']) {
                $dataAllowance = $_COOKIE['allowance'];
            } else {
                $dataAllowance = '';
            }
            if ($_COOKIE['reserve']) {
                $dataReserve = $_COOKIE['reserve'];
            } else {
                $dataReserve = '';
            }
            if ($_COOKIE['renew-date']) {
                $renewDate = $_COOKIE['renew-date'];
            } else {
                $renewDate = '';
            }
        }

        // set cookies based on form values
        setcookie( 'remaining', $dataRemaining, strtotime( '+30 days' ) );
        setcookie( 'allowance', $dataAllowance, strtotime( '+30 days' ) );
        setcookie( 'reserve', $dataReserve, strtotime( '+30 days' ) );
        setcookie( 'renew-date', $renewDate, strtotime( '+30 days' ) );

        $currentDate = new DateTime();
        $currentDay = $currentDate->format('d');

        $tweaked_renewal = $renewDate - 1;
        $modify_date_string = '+'.$tweaked_renewal." day";

        if ($currentDay >= $renewDate) {
            $startDate = new DateTime('first day of this month');
            $startDate->modify($modify_date_string);            
            $startDate->setTime(0, 0);
            $startDate_string = $startDate->format('jS, F Y H:i');
            
            $endDate = new DateTime('first day of next month');
            $endDate->modify($modify_date_string);
            $endDate->setTime(0, 0);
            $endDate_string = $endDate->format('jS, F Y H:i');
        } else {
            $startDate = new DateTime('first day of last month');
            $startDate->modify($modify_date_string);          
            $startDate->setTime(0, 0);
            $startDate_string = $startDate->format('jS, F Y H:i');
            
            $endDate = new DateTime('first day of this month');
            $endDate->modify($modify_date_string);          
            $endDate->setTime(0, 0);
            $endDate_string = $endDate->format('jS, F Y H:i');
        }

        
    $passed = $currentDate->diff($startDate);
    $sinceRenewal_string = $passed->format('%d')." Days ".$passed->format('%h')." Hours ".$passed->format('%i')." Minutes";
    $passed_total_minutes = ($passed->format('%d') * 24 * 60)
                            + ($passed->format('%h') * 60)
                            + ($passed->format('%i'));
    $sinceRenewal_minutes = $passed_total_minutes;

    $remaining = $currentDate->diff($endDate);
    $untilRenewal_string = $remaining->format('%a')." Days ".$remaining->format('%h')." Hours ".$remaining->format('%i')." Minutes";
    $remaining_total_minutes = ($remaining->format('%d') * 24 * 60)
                            + ($remaining->format('%h') * 60)
                            + ($remaining->format('%i'));
    $untilRenewal_minutes = $remaining_total_minutes;

   
    $data_used_mb = ($dataAllowance * 1000) - ($dataRemaining * 1000); 

    $current_usage_min = $data_used_mb /  $passed_total_minutes;       
    $current_usage_hour = $current_usage_min * 60;
    $current_usage_day = $current_usage_hour * 24;



    $target_available_mb = ($dataAllowance * 1000) + ($dataReserve * 1000); 

    
    $minutes_this_period = $untilRenewal_minutes + $sinceRenewal_minutes;
    $days_this_period = round($minutes_this_period / 60 / 24);

    $target_daily_usage_mb = $target_available_mb / $days_this_period;
   
    $data_left = ($dataRemaining * 1000) + ($dataReserve * 1000); 

    $data_minutes_left = $data_left / $current_usage_min; 
    $data_hours_left = $data_minutes_left / 60;
    $data_days_left =  $data_hours_left / 24;

    if($data_minutes_left < $untilRenewal_minutes) {
        $overuse = "overuse";
    } else {
        $overuse = "";
    }

    $running_out_date = $currentDate->modify('+' . (int)$data_minutes_left . ' minute');
    $running_out_date_string = $running_out_date->format('jS, F Y H:i');
    
    } else {
        if ($_COOKIE['remaining']) {
            $dataRemaining = $_COOKIE['remaining'];
        } else {
            $dataRemaining = '';
        }        
        if ($_COOKIE['allowance']) {
            $dataAllowance = $_COOKIE['allowance'];
        } else {
            $dataAllowance = '';
        }
        if ($_COOKIE['reserve']) {
            $dataReserve = $_COOKIE['reserve'];
        } else {
            $dataReserve = '';
        }
        if ($_COOKIE['renew-date']) {
            $renewDate = $_COOKIE['renew-date'];
        } else {
            $renewDate = '';
        }
    }
?>
<html>
    <head>
        <meta name='viewport' content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
        <script src="js/script.js"></script>
        <link rel="stylesheet" href="css/style.css" >

        <title>GiffGaff Data Usage Calulator</title>
    </head>
    <body>
        <div class='container'>
            <h1>Simple Data Usage Calculator</h1>
            <p>Data Remaining can be negative when using the reserve</p>
            <p>Numbers are stored in cookies to save you inputting every time</p>
            <?php if($submitted) { ?>
                <div class='row gap-3 g-3 <?php echo $overuse; ?>'>
                    <div class='col-sm results'>
                        Running out on <?php echo $running_out_date_string;?><br />
                        Renews on <?php echo $endDate_string;?>
                    </div>
                    <div class='col-sm results'>
                        Current Daily Usage (MB) <?php echo number_format($current_usage_day, 2, '.', ',');?><br />
                        Target Daily Usage(MB) <?php echo number_format($target_daily_usage_mb, 2, '.', ',');?>
                    </div>
                    <div class='col-sm results'>
                        Days Remaining at Current Usage <?php echo number_format($data_days_left, 2, '.', ',');?>
                    </div>
                </div>
            <?php } ?>
            
            <div class='form row gap-3 g-3'>
                <form method='post'>
                    <input type='hidden' name='post-submitted'/>
                    <div class='form-group'>                        
                        <div class='row'>
                            <div class='col-sm'>
                                <label for='remaining'>Data Remaining (GB)</label>
                                <input autofocus class='form-control' type='text' name='remaining' id='remaining' value='<?php echo $dataRemaining; ?>' placeholder='Data Remaining (GB)' required/>
                            </div>
                            
                            <div class='col-sm'>
                                <label for='renew-date'>Data Renewal (Just the day part of the date)</label>
                                <input min="1" max="31" step="1" class='form-control' type='number' name='renew-date' id='renew-date' value='<?php echo $renewDate; ?>' placeholder='Renewal date' required/>
                            </div> 
                        </div>
                    </div>                    

                    <div class='form-group'>
                        <div class='row'>
                            <div class='col-sm'>
                                <label for='allowance'>Data Allowance (GB)</label>
                                <input min="1" step="1" class='form-control' type='number' name='allowance' id='allowance' value='<?php echo $dataAllowance; ?>' placeholder='Data Allowance (GB)' required/>
                            </div>

                            <div class='col-sm'>
                                <label for='reserve'>Data Reserve (GB)</label>
                                <input min="0" step="1" class='form-control' type='number' name='reserve' id='reserve' value='<?php echo $dataReserve; ?>' placeholder='Data Reserve (GB)' required/>        
                            </div>
                        </div>                        
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
            </div>            
        </div>
    </body>
</html>