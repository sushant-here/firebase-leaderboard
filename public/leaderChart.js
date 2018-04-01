var playersRef = firebase.database().ref('players');

$(document).ready(function(){
    buildGraph();
});

/**
 * Charting stuff...
 */

function buildGraph() {
    var colorUtils = Chart.helpers.color;
    chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    var userIndex = {};//Map from internal user ID to the index of the user data in the datasets below
    //data - will get updated async
    var horizontalBarChartData = {
        labels: [],
        datasets: [{
            label: 'Wins',
            backgroundColor: colorUtils(chartColors.green).alpha(0.5).rgbString(),
            borderColor: chartColors.green,
            borderWidth: 1,
            hidden:true,
            data: []
        }, {
            label: 'Losses',
            backgroundColor: colorUtils(chartColors.red).alpha(0.5).rgbString(),
            borderColor: chartColors.red,
            borderWidth: 1,
            hidden:true,
            data: []
        }, {
            label: 'Total points',
            backgroundColor: colorUtils(chartColors.blue).alpha(0.5).rgbString(),
            borderColor: chartColors.blue,
            borderWidth: 1,
            data: []
        }]
    };

    //the actual charat - will use this to trigger a redraw when data changes.
    var horizontalBar = new Chart($('#chartCanvas'), {
        type: 'horizontalBar',
        data: horizontalBarChartData,
        options: {
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                rectangle: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            legend: {
                position: 'top',
            },
            scales: {
                xAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: false,
            }
        }
    });

    // player added - load data
    playersRef.orderByChild("totalPoints").on('child_added', snap => {
        userIndex[snap.key] = horizontalBarChartData.labels.length;
        horizontalBarChartData.labels.push(snap.child('name').val());

        $.each(horizontalBarChartData.datasets, function(i, dataset){
            if (dataset.label == 'Wins')
            {
                dataset.data.push(snap.child('won').numChildren());
            }
            else if (dataset.label == 'Losses')
            {
                dataset.data.push(snap.child('lost').numChildren());
            }
            else
            {
                dataset.data.push(parseFloat(snap.child('totalPoints').val()).toFixed(2));
            }
        });

        horizontalBar.update();
    });

    // Player data changed - redraw their graph
    playersRef.on('child_changed', snap => {
        var userDataIndex = userIndex[snap.key];

        $.each(horizontalBarChartData.datasets, function(i, dataset){
            if (dataset.label == 'Wins')
            {
                dataset.data[userDataIndex] = snap.child('won').numChildren();
            }
            else if (dataset.label == 'Losses')
            {
                dataset.data[userDataIndex] = snap.child('lost').numChildren();
            }
            else
            {
                dataset.data[userDataIndex] = parseFloat(snap.child('totalPoints').val()).toFixed(2);
            }
        });

        horizontalBar.update();
    });
}